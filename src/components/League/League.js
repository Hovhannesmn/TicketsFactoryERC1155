import {ethers} from "ethers"
import {useEffect, useState} from "react";
import "./Legue.css";
import ArmenianLeagueTicketsFactoryRinkeby from "../../ArmenianLeagueTicketsFactory.deployed.json";
import ArmenianLeagueTicketsFactoryDev from "../../ArmenianLeagueTicketsFactory.deployed-dev.json";


const TEAMS = [
  {
    id: '0',
    name: 'Shirak',
  },
  {
    id: '1',
    name: 'Bananc',
  },
  {
    id: '2',
    name: 'Pyunik',
  },
  {
    id: '3',
    name: 'Alashkert',
  },
  {
    id: '4',
    name: 'Ararat',
  },
  {
    id: '5',
    name: 'Real Madrid',
  },
  {
    id: '6',
    name: 'Ganzasar',
  },
  {
    id: '7',
    name: 'Lori',
  },
  {
    id: '8',
    name: 'Mika',
  },
  {
    id: '9',
    name: 'Ulic',
  },
];

function League() {
  const [contractData, setContractData] = useState({
    owner: '',
    contract: {},
    provider: {},
    balance: '',
    cost: '',
  });
  const [error, setError] = useState("");

  const {contract, owner, cost, balance, networkName, provider} = contractData;

  const mint = async (id) => {
      try {
        const options = {
          value: ethers.utils.parseEther("0.01"),
          // from: owner //@TODO when need to change owner msg.from address
        };
        const uri = await contract.uri(id)
        const transaction = await contract.mint(owner, id, 1, options);
        await transaction.wait();
        const log = await provider.getTransactionReceipt(transaction.hash);
        debugger;

        console.log("log is ", log.logs);
        // setError(log.logs.toString());

        if (!uri && networkName === 'rinkeby') {
          const transactionSetURI = await contract.setURI(id, `${ArmenianLeagueTicketsFactoryRinkeby.baseUrl + id}`)
          transactionSetURI.wait();
          setError('');
        }
        await initialConnection();
      } catch (e) {
        setError(e.data !== undefined ? e.data.message : e.message);
      }
  }

  const initialConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      const data = await window.ethereum.request({method: "eth_requestAccounts"});
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const singer = provider.getSigner();
      const network = await provider.getNetwork();

      const contract = new ethers.Contract(
         network.name === "rinkeby" ? ArmenianLeagueTicketsFactoryRinkeby.address : ArmenianLeagueTicketsFactoryDev.address,
        network.name === "rinkeby" ? ArmenianLeagueTicketsFactoryRinkeby.abi : ArmenianLeagueTicketsFactoryDev.abi,
        singer
      );

      const costHexadecimal = await contract.cost();
      const balance = await provider.getBalance(data[0]);
      debugger;

      setContractData({
        contract,
        provider,
        networkName: network.name,
        owner: data[0],
        cost: ethers.utils.formatEther(costHexadecimal),
        balance: ethers.utils.formatEther(balance),
      });
    } else {
      console.log("Your browser does not support metamask. Please use other browser");
    }
  }

  const withdraw = async () => {
    try {
      const withdraw = await contract.withdraw();
      await withdraw.wait()

      await initialConnection();
      setError('');
    } catch (e) {
      setError(e.data !== undefined ? e.data.message : e.message);
    }

  }

  useEffect(  () => {
    initialConnection();
  }, [])

  return (
    <div className="App">
      <h3>Ticket cost is: {cost} Ether</h3>
      <h3>Ticket cost is: {balance} Ether</h3>
      <p style={{color: 'red'}}>{error}</p>
      <table className="table">
        <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Team Name</th>
          <th scope="col">ticket count</th>
          <th scope="col">buy ticket</th>
        </tr>
        </thead>
        <tbody>
        {
          TEAMS.map((val, key) => (
            <>
              <tr>
                <th scope="row">{++key}</th>
                <td>{val.name}</td>
                <td>0</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => mint(key)}
                  >buy ticket</button>
                </td>
              </tr>
            </>
          ))
        }
        </tbody>
      </table>
      <button className="buttonSuccess" onClick={withdraw} > withdraw </button>
    </div>
  );
}

export default League;



