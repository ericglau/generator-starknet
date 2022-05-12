const { NILE, HARDHAT } = require("./constants");
const { formatArgs, formatLines } = require("./utils");

function getConstructorProps(props) {
  if (props.framework === NILE) {
    if (!props.customizeERC20) {
      return {
        testingVars: formatLines([
          "OWNER = 42",
          'NAME = str_to_felt("Starknet")',
          'SYMBOL = str_to_felt("STARK")',
          "INIT_SUPPLY = to_uint(1000)",
          "DECIMALS = 18",
        ]),
        constructorCalldata: "NAME, SYMBOL, DECIMALS, *INIT_SUPPLY, OWNER",
      };
    }

    const calldata = [];

    if (props.erc20premint && props.erc20premint !== "0") {
      calldata.push(
        props.erc20upgradeable ? "admin.contract_address" : "OWNER"
      ); // Recipient
    }

    if (props.erc20mintable || props.erc20pausable) {
      calldata.push(
        props.erc20upgradeable ? "admin.contract_address" : "OWNER"
      ); // Owner
    }

    if (props.erc20upgradeable) {
      calldata.push("admin.contract_address"); // Proxy admin
    }

    return {
      testingVars: props.erc20upgradeable
        ? `NAME = str_to_felt("${props.erc20name}")`
        : formatLines([
            "OWNER = 42",
            `NAME = str_to_felt("${props.erc20name}")`,
          ]),
      constructorCalldata: formatArgs(calldata),
    };
  }

  if (props.framework === HARDHAT) {
    if (!props.customizeERC20) {
      return {
        testingVars: formatLines([
          "const OWNER = 42",
          'const NAME = starknet.shortStringToBigInt("Starknet")',
          'const SYMBOL = starknet.shortStringToBigInt("STARK")',
          "const INIT_SUPPLY = { low: 1000, high: 0 }",
          "const DECIMALS = 18",
        ]),
        constructorCalldata: formatArgs([
          "name: NAME",
          "symbol: SYMBOL",
          "decimals: DECIMALS",
          "initial_supply: INIT_SUPPLY",
          "recipient: OWNER",
        ]),
      };
    }

    const calldata = [];

    if (props.erc20premint && props.erc20premint !== "0") {
      calldata.push("recipient: OWNER");
    }

    if (props.erc20mintable || props.erc20pausable) {
      calldata.push("owner: OWNER");
    }

    return {
      testingVars: formatLines([
        "const OWNER = 42",
        `const NAME = starknet.shortStringToBigInt("${props.erc20name}")`,
      ]),
      constructorCalldata: formatArgs(calldata),
    };
  }
}

module.exports = { getERC20ConstructorProps: getConstructorProps };
