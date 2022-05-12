const { NILE, HARDHAT } = require("./constants");

function formatArgs(args) {
  return args.join(", ");
}

function formatLines(lines) {
  return lines.join("\n");
}

function getConstructorProps(props) {
  if (props.framework === NILE) {
    if (!props.customizeERC20) {
      return {
        testingVars: formatLines([
          'NAME = str_to_felt("Starknet")',
          'SYMBOL = str_to_felt("STARK")',
          "INIT_SUPPLY = to_uint(1000)",
          "DECIMALS = 18",
        ]),
        constructorCalldata: "NAME, SYMBOL, DECIMALS, *INIT_SUPPLY, OWNER",
      };
    }

    const calldata = [];

    if (props.erc20premint) {
      calldata.push("OWNER"); // Recipient
    }

    if (props.erc20mintable || props.erc20pausable) {
      calldata.push("OWNER"); // Owner
    }

    return {
      testingVars: `NAME = str_to_felt("${props.erc20name}")`,
      constructorCalldata: formatArgs(calldata),
    };
  }

  if (props.framework === HARDHAT) {
    if (!props.customizeERC20) {
      return {
        testingVars: formatLines([
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

    if (props.erc20premint) {
      calldata.push("recipient: OWNER");
    }

    if (props.erc20mintable || props.erc20pausable) {
      calldata.push("owner: OWNER");
    }

    return {
      testingVars: `const NAME = starknet.shortStringToBigInt("${props.erc20name}")`,
      constructorCalldata: formatArgs(calldata),
    };
  }
}

module.exports = { getConstructorProps };
