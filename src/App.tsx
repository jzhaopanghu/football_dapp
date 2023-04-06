import React from 'react';
import './App.css';
import { Types,AptosAccount,AptosClient, MaybeHexString, HexString, FaucetClient } from "aptos";



export const NODE_URL = process.env.APTOS_NODE_URL || "http://localhost:8080";
export const FAUCET_URL = process.env.APTOS_FAUCET_URL || "http://localhost:8081";


/**
 * JzhaoMoney Client
 */
class CoinClient extends AptosClient {
  constructor() {
    super(NODE_URL);
  }

  async registerCoin(coinTypeAddress: HexString, coinReceiver: AptosAccount): Promise<string> {
    const rawTxn = await this.generateTransaction(coinReceiver.address(), {
      function: "0x1::managed_coin::register",
      type_arguments: [`${coinTypeAddress.hex()}::jzhao_money::JzhaoMoney`],
      arguments: [],
    });
    const bcsTxn = await this.signTransaction(coinReceiver, rawTxn);
    const pendingTxn = await this.submitTransaction(bcsTxn);

    return pendingTxn.hash;
  }

  async mintCoin(minter: AptosAccount, receiverAddress: HexString, amount: number | bigint): Promise<string> {
    const rawTxn = await this.generateTransaction(minter.address(), {
      function: "0x1::managed_coin::mint",
      type_arguments: [`${minter.address()}::jzhao_money::JzhaoMoney`],
      arguments: [receiverAddress.hex(), amount],
    });

    const bcsTxn = await this.signTransaction(minter, rawTxn);
    const pendingTxn = await this.submitTransaction(bcsTxn);

    return pendingTxn.hash;
  }

  async getBalance(accountAddress: MaybeHexString, coinTypeAddress: HexString): Promise<string | number> {
    try {
      const resource = await this.getAccountResource(
        accountAddress,
        `0x1::coin::CoinStore<${coinTypeAddress.hex()}::jzhao_money::JzhaoMoney>`,
      );
      return parseInt((resource.data as any)["coin"]["value"]);
    } catch (_) {
      return 0;
    }
  }
}
const client = new CoinClient();
const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);

  // 模块发布到该用户地址下
  //用户a address 0x3929de9dabd020b078cf30d609e5ca73a63562cc0e9f20d5a82a56859c9f6e9d
  //此处需填写用户a秘钥才能运行
  const privateStringByA = "*****************";
  const privateKeyBytesByA = HexString.ensure(privateStringByA).toUint8Array();
  const userAccount = new AptosAccount(privateKeyBytesByA);

  //用户b address 0x538205aa9f14975f62d1a56eb08010519e70498da8f0925b81efdbe511692095
  //此处需填写用户b秘钥才能运行
  const privateStringByB = "*****************";
  const privateKeyBytesByB = HexString.ensure(privateStringByB).toUint8Array();
  const userBAccount = new AptosAccount(privateKeyBytesByB);

function App() {
  const urlAddress = window.location.pathname.slice(1);
  const isEditable = !urlAddress;

  
  const [address, setAddress] = React.useState<string | string>("");
  // JMD 余额
  const [JMDBalance, setJMDBalance] = React.useState<string | number>(0);
  // 当前钱包用户
  const [nowAccount, setNowAccount] = React.useState<AptosAccount | AptosAccount>();

  const init = async() => {
    // connect
    const { address, publicKey } = await window.aptos.connect();
    client.getBalance(address, userAccount.address()).then(setJMDBalance);
    setAddress(address);
    setNowAccount(userAccount.address().hex().localeCompare(address) == 0 ? userAccount : userBAccount);
  }
   React.useEffect(() => {
     init();
  }, []);

  client.registerCoin(userAccount.address(), nowAccount);

  const [account, setAccount] = React.useState<Types.AccountData | null>(null);
  const [resources, setResources] = React.useState<Types.MoveResource[]>([]);
  
  React.useEffect(() => {
    if (!address) return;
    client.getAccountResources(address).then(setResources);
  }, [address]);

  const resourceType = `${userAccount.address()}::football::FootBallStar`;
  const resource = resources.find((r) => r.type === resourceType);
  const data = resource?.data as {name: string,country: string,position: string,value: string} | undefined;
  // 球星名称
  const name = data?.name;
  // 球星国家
  const country = data?.country;
  // 球星位置
  const position = data?.position;
  // 价格
  const value = data?.value;


  const toName = React.createRef<HTMLTextAreaElement>();
  const toCountry = React.createRef<HTMLTextAreaElement>();
  const toPosition = React.createRef<HTMLTextAreaElement>();
  const toValue = React.createRef<HTMLTextAreaElement>();
  const saveSubmit = async (e: any) => {
    if (!toName.current || !toCountry.current || !toPosition.current || !toValue.current) return;

    const name = toName.current.value;
    const country = toCountry.current.value;
    const position = toPosition.current.value;
    const val = toValue.current.value;
    const transaction = {
      type: "entry_function_payload",
      function: `${userAccount.address()}::football::create_star`,
      arguments: [name,country,position,val],
      type_arguments: [],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };
  // 删除球星卡
  const resetInfo = async (e: any) => {
    const transaction = {
      type: "entry_function_payload",
      function: `${userAccount.address()}::football::del_info`,
      arguments: [address],
      type_arguments: [],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };

  // 增加余额
  const mint = async (e: any) => {
    await client.mintCoin(userAccount, nowAccount.address(), 1000);
    window.location.reload()
  };
  // 球星交易
  const from_addr = React.createRef<HTMLTextAreaElement>();
  const transfer = async (e: any) => {
    if (!from_addr.current ) return;
    const addr = from_addr.current.value;
    const transaction = {
      type: "entry_function_payload",
      function: `${userAccount.address()}::football::transfer`,
      arguments: [addr],
      type_arguments: [],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };
  

  return (
    <div className="App">
      <p><code>address: { address }</code></p>
      <p><code>JMD余额: { JMDBalance } </code><input type="button" value="增加余额" onClick={mint}/></p>
      <form onSubmit={saveSubmit}>
        球星名称:<textarea ref={toName} defaultValue={name} readOnly={!isEditable} disabled={!isEditable}/>
        球星国家:<textarea ref={toCountry} defaultValue={country} readOnly={!isEditable} disabled={!isEditable}/>
        球星位置:<textarea ref={toPosition} defaultValue={position} readOnly={!isEditable} disabled={!isEditable}/>
        球星价格:<textarea ref={toValue} defaultValue={value} readOnly={!isEditable} disabled={!isEditable}/>
        <div>
          <input type="submit" value="保存且生成球星信息"/><input type="button" value="删除或重置球星信息" onClick={resetInfo}/>
        </div>
        购买球星的地址:<textarea ref={from_addr}  readOnly={!isEditable} disabled={!isEditable}/>
        <input type="button" value="购买" onClick={transfer}/>
      </form>
    </div>
  );
}

export default App;