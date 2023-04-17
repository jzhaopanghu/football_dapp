import React from 'react';
import '../App.css';
import { AptosClient, MaybeHexString } from "aptos";
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

function Buy() {
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

  const [name, setName] = React.useState<string | undefined>("");
  const [country, setCountry] = React.useState<string | undefined>("");
  const [position, setPosition] = React.useState<string | undefined>("");
  const [value, setValue] = React.useState<string | undefined>("");
  // 查询
  const from_addr = React.createRef<HTMLTextAreaElement>();
  const getStarInfo = async (e: any) => {
    if (!from_addr.current ) return;
    const addr = from_addr.current.value;
    const resources = await client.getAccountResources(addr);
    const resourceType = `${moduleAddress}::football::FootBallStar`;
    const resource = resources.find((r) => r.type === resourceType);
    const data = resource?.data as {name: string,country: string,position: string,value: string} | undefined;
    // 球星名称
    setName(data?.name);
    // 球星国家
    setCountry(data?.country);
    // 球星位置
    setPosition(data?.position)
    // 价格
    setValue(data?.value)
  };

  // 球星交易
  const transfer = async (e: any) => {
    if (!from_addr.current ) return;
    const addr = from_addr.current.value;
    const transaction = {
      type: "entry_function_payload",
      function: `${moduleAddress}::football::transfer`,
      arguments: [addr],
      type_arguments: [],
    };
    await window.aptos.signAndSubmitTransaction(transaction);
    window.location.reload()
  };

  return (
    <div className="App">
      <p><code>address: { address }</code></p>
      <p><code>JMD余额: { JMDBalance } </code></p>
        请填写要购买球星所在address:<textarea ref={from_addr}  />
        <input type="button" value="预览球星信息" onClick={getStarInfo}/>
        球星名称:<textarea defaultValue={name} readOnly={!isEditable} disabled={!isEditable}/>
        球星国家:<textarea defaultValue={country} readOnly={!isEditable} disabled={!isEditable}/>
        球星位置:<textarea defaultValue={position} readOnly={!isEditable} disabled={!isEditable}/>
        球星价格:<textarea defaultValue={value} readOnly={!isEditable} disabled={!isEditable}/>
        <input type="button" value="购买" onClick={transfer}/>
        <Link to="/User">返回主界面</Link>
    </div>
  );
  
}
export default Buy;