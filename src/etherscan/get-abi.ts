import axios from "axios";

const getAbi = async (address: string) => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`;
  const res = await axios.get(url);
  const abi = JSON.parse(res.data.result);

  //   const provider = new ethers.providers.JsonRpcProvider(infuraUrl)
  //   const contract = new ethers.Contract(
  //     address,
  //     abi,
  //     provider
  //   )

  //   const name = await contract.name()
  //   const totalSupply = await contract.totalSupply()

  //   console.log(name)
  //   console.log(totalSupply.toString())
  return abi;
};

export default getAbi;
