import React from 'react';
import '../App.css';
import { Types,AptosClient, MaybeHexString, FaucetClient } from "aptos";
import { Link } from 'react-router-dom';

declare const window: any;

export const NODE_URL = process.env.APTOS_NODE_URL || "http://localhost:8080";
export const FAUCET_URL = process.env.APTOS_FAUCET_URL || "http://localhost:8081";


/**
 * JzhaoMoney Client
 */
class CoinClient extends AptosClient {
  constructor() {
    super(NODE_URL);
  }
  // 查询币余额
  async getBalance(accountAddress: MaybeHexString): Promise<string | number> {
    try {
      const resource = await this.getAccountResource(
        accountAddress,
        `0x1::coin::CoinStore<${moduleAddress}::jzhao_money::JzhaoMoney>`,
      );
      return parseInt((resource.data as any)["coin"]["value"]);
    } catch (_) {
      //无币资源则进行注册币种
      const transaction = {
        type: "entry_function_payload",
        function: `0x1::managed_coin::register`,
        arguments: [],
        type_arguments: [`${moduleAddress}::jzhao_money::JzhaoMoney`],
      };
      await window.aptos.signAndSubmitTransaction(transaction);
      return 0;
    }
  }
}
const client = new CoinClient();
// 模块发布到该用户地址下
const moduleAddress = "0x3929de9dabd020b078cf30d609e5ca73a63562cc0e9f20d5a82a56859c9f6e9d";

function User() {
  const urlAddress = window.location.pathname.slice(1);
  const isEditable = !urlAddress;
  
  const [address, setAddress] = React.useState<string | string>("");
  // JMD 余额
  const [JMDBalance, setJMDBalance] = React.useState<string | number>(0);

  const init = async() => {
    // connect
    const { address, publicKey } = await window.aptos.connect();
    client.getBalance(address).then(setJMDBalance);
    setAddress(address);
  }
   React.useEffect(() => {
     init();
  }, []);

  const [resources, setResources] = React.useState<Types.MoveResource[]>([]);
  
  React.useEffect(() => {
    if (!address) return;
    client.getAccountResources(address).then(setResources);
  }, [address]);

  const resourceType = `${moduleAddress}::football::FootBallStar`;
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
      function: `${moduleAddress}::football::create_star`,
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
      function: `${moduleAddress}::football::del_info`,
      arguments: [address],
      type_arguments: [],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };

  // 增加余额
  const mint = async (e: any) => {
    const transaction = {
      type: "entry_function_payload",
      function: `0x1::managed_coin::mint`,
      arguments: [address,1000],
      type_arguments: [`${moduleAddress}::jzhao_money::JzhaoMoney`],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };
  
  

  return (
    <div className="App">
      <p><code>address: { address }</code></p>
      <p><code>JMD余额: { JMDBalance } </code><input type="button" value="铸币(只限资源用户)" onClick={mint}/></p>
      <form onSubmit={saveSubmit}>
        球星名称:<textarea ref={toName} defaultValue={name} readOnly={!isEditable} disabled={!isEditable}/>
        球星国家:<textarea ref={toCountry} defaultValue={country} readOnly={!isEditable} disabled={!isEditable}/>
        球星位置:<textarea ref={toPosition} defaultValue={position} readOnly={!isEditable} disabled={!isEditable}/>
        球星价格:<textarea ref={toValue} defaultValue={value} readOnly={!isEditable} disabled={!isEditable}/>
        <div>
          <input type="submit" value="保存且生成球星信息"/><input type="button" value="删除或重置球星信息" onClick={resetInfo}/>
        </div>
        <Link to="/buy">进入购买页面</Link>
      </form>
    </div>
  );
  
}
export default User;