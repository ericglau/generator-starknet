const { NILE, HARDHAT } = require("./constants");
const { formatArgs, formatLines } = require("./utils");

function getConstructorProps(props) {
  if (props.framework === NILE) {
    if (!props.customizeERC721) {
      return {
        testingVars: formatLines([
          "OWNER = 42",
          'NAME = str_to_felt("Starknet NFT")',
          'SYMBOL = str_to_felt("STARK")',
        ]),
        constructorCalldata: "NAME, SYMBOL, OWNER",
      };
    }

    const calldata = [];

    if (props.erc721mintable || props.erc721pausable) {
      calldata.push("OWNER"); // Owner
    }

    return {
      testingVars: formatLines([
        "OWNER = 42",
        `NAME = str_to_felt("${props.erc721name}")`,
      ]),
      constructorCalldata: formatArgs(calldata),
    };
  }

  if (props.framework === HARDHAT) {
    if (!props.customizeERC721) {
      return {
        testingVars: formatLines([
          "const OWNER = 42",
          'const NAME = starknet.shortStringToBigInt("Starknet NFT")',
          'const SYMBOL = starknet.shortStringToBigInt("STARK")',
        ]),
        constructorCalldata: formatArgs([
          "name: NAME",
          "symbol: SYMBOL",
          "owner: OWNER",
        ]),
      };
    }

    const calldata = [];

    if (props.erc721mintable || props.erc721pausable) {
      calldata.push("owner: OWNER");
    }

    return {
      testingVars: formatLines([
        "const OWNER = 42",
        `const NAME = starknet.shortStringToBigInt("${props.erc721name}")`,
      ]),
      constructorCalldata: formatArgs(calldata),
    };
  }
}

module.exports = { getERC721ConstructorProps: getConstructorProps };
