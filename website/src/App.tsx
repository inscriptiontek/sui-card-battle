import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Heading } from "@radix-ui/themes";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Box>
        <Heading>dApp Starter Template</Heading>
      </Box>
      <Box>
        <ConnectButton />
      </Box>
      ``
    </>
  );
}

export default App;
