import React from "react";
import ReactDOM from "react-dom/client";
// 链插件
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 路由
import { BrowserRouter, Route, Routes } from "react-router-dom";
// tailwind样式
import "./index.css";

// 导入组件
import { networkConfig } from "./context/networkConfig.ts";
import Home from "./pages/Home.tsx";
import CreateBattle from "./pages/CreateBattle.tsx";
import Battle from "./pages/Battle.tsx";
// import Test from "./components/Test.tsx";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          {/* <App></App>
           *********************** */}

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-battle" element={<CreateBattle />} />
              <Route path="/battle/:id" element={<Battle />} />
              {/* <Route path="/test" element={<Test />} /> */}
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
