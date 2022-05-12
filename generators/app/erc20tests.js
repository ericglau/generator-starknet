const { NILE, HARDHAT } = require("./constants");

function formatArgs(...args) {
  return args.join(", ");
}

function formatLines(...lines) {
  return lines.join("\n");
}

function getConstructorProps(props) {
  if (props.framework === NILE) {
    if (!props.customizeERC20) {
      return {
        constructorVars: formatLines(
          'NAME = str_to_felt("Starknet")',
          'SYMBOL = str_to_felt("STARK")',
          "INIT_SUPPLY = to_uint(1000)",
          "DECIMALS = 18"
        ),
        constructorCalldata: "NAME, SYMBOL, DECIMALS, *INIT_SUPPLY, OWNER",
      };
    }

    const vars = [];
    const calldata = [];

    return {
      constructorVars: formatArgs(vars),
      constructorCalldata: formatLines(calldata),
    };
  }

  if (props.framework === HARDHAT) {
    if (!props.customizeERC20) {
      return {
        constructorVars: formatLines(
          'const NAME = starknet.shortStringToBigInt("Starknet")',
          'const SYMBOL = starknet.shortStringToBigInt("STARK")',
          "const INIT_SUPPLY = { low: 1000, high: 0 }",
          "const DECIMALS = 18"
        ),
        constructorCalldata: formatLines(
          "name: NAME",
          "symbol: SYMBOL",
          "decimals: DECIMALS",
          "initial_supply: INIT_SUPPLY",
          "recipient: OWNER"
        ),
      };
    }

    const vars = [];
    const calldata = [];

    return {
      constructorVars: formatArgs(vars),
      constructorCalldata: formatLines(calldata),
    };
  }
}

module.exports = { getConstructorProps };
