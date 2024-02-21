module game::card {
    use std::hash::sha2_256;
    use std::string::String;
    use std::option::{Option, none, some};
    use std::string;
    use std::vector;
    use sui::clock;
    use sui::clock::Clock;
    use sui::event::emit;
    use sui::hmac::hmac_sha3_256;
    use sui::object;
    use sui::object::{UID, ID};
    use sui::table;
    use sui::table::{Table};
    use sui::transfer::{public_transfer, public_share_object};
    use sui::tx_context;
    use sui::tx_context::{TxContext, sender};

    // ======== Constants ========
    const MAX_ATTACK_DEFEND_STRENGTH : u64 = 18;

    const MAX_HEATH : u64 = 25;
    const MAX_MANA:u64 = 100;

    const BATTLE_STATUS_PENDDING : u64 = 0;
    const BATTLE_STATUS_START : u64 = 1;
    const BATTLE_STATUS_END : u64 = 2;

    const CHOICE_ATTACH : u64 = 1;
    const CHOICE_DEFENSE: u64 = 2;

    // ======== Errors =========
    const EBattleNotPending: u64 = 1;
    const EBattleNotStarted: u64 = 2;
    const EChoiceNotAllowed: u64 = 3;
    const ENotPlayer: u64 = 4;

    const EWaitFor: u64 = 5;
    const ENotEnoughMana: u64 = 6;

    const EEmptyBattleName: u64 = 7;


    struct BattleRecord has key,store {
        id: UID,
        battles: vector<ID>,
    }

    struct CardRecord has key,store {
        id: UID,
        cards: vector<ID>,
    }

    struct PlayerStatus  has store {
        health: u64,
        mana: u64,
    }

    struct Card has key,store {
        id: UID,
        attack: u64,
        defense: u64,
    }

    struct Battle has key,store {
        id: UID,
        name: String,
        status: u64,
        cards: Table<address, Card>,
        players: vector<address>,
        player_status: Table<address, PlayerStatus>,
        moves: Table<address, u64>,
        winer: Option<address>,
    }

    // ======== Events =========
    // new card
    struct NewCard has copy,drop {
        card: ID,
        owner: address,
    }
    // new battle
    struct NewBattle has copy,drop {
        id:ID,
    }
    // join battle
    struct JoinBattle has copy,drop {
        id: ID,
    }
    // choice
    struct MoveChoice has copy,drop {
        battld_id: ID,
        choice: u64,
    }
    // battle end
    struct BattleEnd has copy,drop {
        battld_id: ID,
        winer: Option<address>,
        loser: Option<address>,
    }
    // cancel battle
    struct BattleCancel has copy,drop {
        battld_id: ID,
    }

    fun init(ctx: &mut TxContext) {
        let battle_record = BattleRecord {
            id: object::new(ctx),
            battles: vector::empty<ID>(),
        };
        let card_record = CardRecord {
            id: object::new(ctx),
            cards: vector::empty<ID>(),
        };

        public_share_object(battle_record);
        public_share_object(card_record)
    }

    public entry fun cancel_battle(battle: &mut Battle, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(battle.status == BATTLE_STATUS_PENDDING, EBattleNotPending);

        let card = table::remove(&mut battle.cards, sender);
        // let _ = table::remove(&mut battle.player_status, sender);
        battle.status == BATTLE_STATUS_END;

        emit(BattleCancel{
            battld_id: object::uid_to_inner(&battle.id),
        });
        public_transfer(card, sender)
    }

    public entry fun create_card(card_record: &mut CardRecord, clock:&Clock,ctx:&mut TxContext) {
        let sender = tx_context::sender(ctx);
        let card = mint_card(clock, ctx);

        vector::push_back(&mut card_record.cards, object::uid_to_inner(&card.id));

        emit(NewCard{
            card: object::uid_to_inner(&card.id),
            owner: tx_context::sender(ctx),
        });

        public_transfer(card, sender)
    }


    public entry fun create_battle(battle_record: &mut BattleRecord, name: vector<u8>, card: Card,ctx: &mut TxContext) {
        let battle_name = string::utf8(name);
        assert!(!string::is_empty(&battle_name), EEmptyBattleName);

        let sender = sender(ctx);
        let cards = table::new<address, Card>(ctx);
        table::add(&mut cards, sender, card);
        let players = vector::empty<address>();
        vector::push_back(&mut players, sender);
        let player_status = table::new<address,PlayerStatus>(ctx);
        table::add(&mut player_status, sender, PlayerStatus{
            health: MAX_HEATH,
            mana: MAX_MANA
        });

        let battle = Battle {
            id: object::new(ctx),
            name:battle_name,
            status: BATTLE_STATUS_PENDDING,
            cards,
            players,
            player_status,
            moves: table::new(ctx),
            winer: none(),
        };

        vector::push_back(&mut battle_record.battles, object::uid_to_inner(&battle.id));
        emit(NewBattle{
            id: object::uid_to_inner(&battle.id),
        });
        public_share_object(battle)
    }

    public entry fun join_battle(card: Card, battle:&mut Battle, ctx: &mut TxContext) {
        assert!(battle.status == BATTLE_STATUS_PENDDING, EBattleNotPending);
        let sender = tx_context::sender(ctx);
        assert!(!table::contains(&battle.player_status, sender), ENotPlayer);

        table::add(&mut battle.cards, sender, card);
        vector::push_back(&mut battle.players, sender);
        table::add(&mut battle.player_status, sender, PlayerStatus{
            health:MAX_HEATH,
            mana: MAX_MANA,
        });
        battle.status = BATTLE_STATUS_START;

        emit(JoinBattle{
            id: object::uid_to_inner(&battle.id),
        })
    }

    public entry fun move_choice(choice: u64, battle: &mut Battle, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(choice == CHOICE_ATTACH || choice == CHOICE_DEFENSE, EChoiceNotAllowed);
        assert!(battle.status == BATTLE_STATUS_START,EBattleNotStarted);
        // move once
        assert!(!table::contains(&battle.moves, sender), EWaitFor);
        // true player
        let player_status = table::borrow(&battle.player_status, sender);
        // enough mana
        if (choice == CHOICE_ATTACH) {
            assert!(player_status.mana >= 3, ENotEnoughMana);
        };

        table::add(&mut battle.moves, sender, choice);

        emit(MoveChoice{
            choice,
            battld_id: object::uid_to_inner(&battle.id),
        });

        // if all moved
        if (table::length(&battle.moves) == 2) {
            resolve_battle(battle,ctx)
        }
    }

    fun mint_card(clock:&Clock,ctx: &mut TxContext) : Card {
        let (attack, defense) = random_strength_clock(clock);

        Card {
            id: object::new(ctx),
            attack,
            defense,
        }
    }

    fun random_strength_clock(clock: &Clock) :(u64, u64){
        let ms = clock::timestamp_ms(clock);
        let random_attack = ms % MAX_ATTACK_DEFEND_STRENGTH;
        if (random_attack == 0) {
            random_attack = MAX_ATTACK_DEFEND_STRENGTH / 2;
        };

        (random_attack, MAX_ATTACK_DEFEND_STRENGTH - random_attack)
    }

    fun resolve_battle(battle:&mut Battle,ctx: &TxContext) {
        let p1 = *vector::borrow<address>(&battle.players,0);
        let p2 = *vector::borrow<address>(&battle.players,1);

        let p1_card = table::borrow(&battle.cards, p1);
        let p2_card = table::borrow(&battle.cards, p2);

        let p1_status = table::remove(&mut battle.player_status, p1);

        let p2_status = table::remove(&mut battle.player_status, p2);

        let p1_moves = table::remove(&mut battle.moves, p1);
        let p2_moves = table::remove(&mut battle.moves, p2);

        if (p1_moves == CHOICE_ATTACH && p2_moves == CHOICE_ATTACH) {
            // p2 优势
            if (p1_status.health <= p2_card.attack) {
                p1_status.health = 0;
                battle.status = BATTLE_STATUS_END;
                battle.winer = some(p2);
                emit(BattleEnd{
                    battld_id: object::uid_to_inner(&battle.id),
                    winer: some(p2),
                    loser: some(p1),
                })
            } else if (p2_status.health <= p1_card.attack) {
                p2_status.health = 0;
                battle.status = BATTLE_STATUS_END;
                battle.winer = some(p2);
                emit(BattleEnd{
                    battld_id: object::uid_to_inner(&battle.id),
                    winer: some(p1),
                    loser: some(p2),
                })
            } else {
                p1_status.health = p1_status.health - p2_card.attack;
                p2_status.health = p2_status.health - p1_card.attack;

                p1_status.mana = p1_status.mana - 3;
                p2_status.mana = p2_status.mana - 3;
            }
        } else if (p1_moves == CHOICE_ATTACH && p2_moves == CHOICE_DEFENSE) {
            let p2_phatom_health = p2_status.health + p2_card.defense;
            if (p1_card.attack >= p2_phatom_health) {
                p2_status.health = 0;
                battle.status = BATTLE_STATUS_END;
                battle.winer = some(p1);
                emit(BattleEnd{
                    battld_id: object::uid_to_inner(&battle.id),
                    winer: some(p1),
                    loser: some(p2),
                })
            } else {
                if (p1_card.attack > p2_card.defense) {
                    p2_status.health = p2_phatom_health - p1_card.attack;
                };
                p2_status.mana = p2_status.mana + 3;
                p1_status.mana = p1_status.mana - 3;
            }
        } else if (p1_moves == CHOICE_DEFENSE && p2_moves == CHOICE_ATTACH) {
            let p1_phatom_health = p1_status.health + p1_card.defense;
            if (p2_card.attack >= p1_phatom_health) {
                p1_status.health = 0;
                battle.status = BATTLE_STATUS_END;
                battle.winer = some(p2);
                emit(BattleEnd{
                    battld_id: object::uid_to_inner(&battle.id),
                    winer: some(p2),
                    loser: some(p1),
                })
            } else {
                if (p2_card.attack > p1_card.defense) {
                    p1_status.health = p1_phatom_health - p2_card.attack;
                };
                p1_status.mana = p1_status.mana + 3;
                p2_status.mana = p2_status.mana - 3;
            }
        } else if (p1_moves == CHOICE_DEFENSE && p2_moves == CHOICE_DEFENSE) {
            p1_status.mana = p1_status.mana + 3;
            p2_status.mana = p2_status.mana + 3;
        };

        table::add(&mut battle.player_status,p1,p1_status);
        table::add(&mut battle.player_status,p2,p2_status);

        // regen attack/defense
        if (battle.status != BATTLE_STATUS_END) {
            let tx_digest = *tx_context::digest(ctx);
            let dig = sha2_256(tx_digest);

            let p1_card = table::borrow_mut(&mut battle.cards, p1);
            let random_1 = hmac_sha3_256(&dig, &object::uid_to_bytes(&p1_card.id));
            let (attack1, defense1) =derive_randomness(&random_1);
            p1_card.attack = attack1;
            p1_card.defense = defense1;

            let p2_card = table::borrow_mut(&mut battle.cards, p2);
            let random_2 = hmac_sha3_256(&dig, &object::uid_to_bytes(&p2_card.id));
            let (attack2, defense2) = derive_randomness( &random_2);
            p2_card.attack = attack2;
            p2_card.defense = defense2;
        };
    }

    fun end_battle(battle: &mut Battle,winer:address) {
        // assert!(!battle.status == BATTLE_STATUS_END, )
        let p1 = *vector::borrow<address>(&battle.players,0);
        let p2 = *vector::borrow<address>(&battle.players,1);

        battle.status = BATTLE_STATUS_END;
        battle.winer = some(winer);

        emit(BattleEnd{
            battld_id: object::uid_to_inner(&battle.id),
            winer: some(winer),
            loser: if (winer == p1) {some(p2)} else {some(p1)},
        });
        //
        // let p1_card = table::remove(&mut battle.cards,p1);
        // let p2_card = table::remove(&mut battle.cards,p2);
        //
        // public_transfer(p1_card, p1);
        // public_transfer(p2_card, p2)
    }

    fun derive_randomness(v2: &vector<u8>) : (u64, u64) {

        let m: u128 = 0;
        let i = 0;
        while (i < 16) {
            m = m << 8;
            let curr_byte = *vector::borrow(v2, i);
            m = m + (curr_byte as u128);
            i = i + 1;
        };

        let max_u128 = (MAX_ATTACK_DEFEND_STRENGTH as u128);
        let random_attack = (m % max_u128 as u64) ;
        if (random_attack == 0) {
            random_attack = MAX_ATTACK_DEFEND_STRENGTH / 2
        };

        (random_attack, MAX_ATTACK_DEFEND_STRENGTH - random_attack)
    }
}