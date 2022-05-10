/**
 * @fileOverview The main code for this generator.
 *
 * @author Abdelhamid Bakhta
 *
 * @requires NPM:yeoman-generator
 * @requires NPM:chalk
 * @requires NPM:yosay
 */

"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const { cwd } = require("process");

const { printERC20, erc20defaults } = require("core-cairo");

// Import { buildERC20, ERC20Options } from 'core-cairo';
// import { printContract } from 'core-cairo';

module.exports = class extends Generator {
  async initializing() {
    await this._greetings();
    this.cwd = cwd();
    this.dirName = this.cwd.substring(this.cwd.lastIndexOf("/") + 1);
    this.supportedFrameworks = ["Nile"];
  }

  // Prompt user for configuration choices
  async prompting() {
    const autoInstallPrompt = {
      type: "confirm",
      name: "wantInstall",
      message: "Do you want to automatically install dependencies?",
      default: false,
    };
    const includeAutoInstallPrompt = false;

    const prompts = [
      {
        type: "input",
        name: "projectName",
        message: "What is the project name?",
        default: this.dirName,
        store: true,
      },
      {
        type: "input",
        name: "outputDir",
        message: "What is the root directory for the generated project?",
        default: this.cwd,
        store: true,
      },
      {
        type: "list",
        name: "framework",
        message: "What framework do you want to use?",
        choices: ["Nile", "Protostar", "Hardhat"],
        default: "Nile",
        store: true,
      },
      {
        type: "confirm",
        name: "wantERC20",
        message: "Do you want to add an ERC20 token contract?",
        store: true,
      },
    ];
    await this.promptAndSave(prompts);

    if (this.props.wantERC20) {
      await this.promptAndSave({
        type: "confirm",
        name: "customizeERC20",
        message: "Customize ERC20?",
        default: true,
      });

      if (this.props.customizeERC20) {
        const defaults = erc20defaults;
        const erc20prompts = [
          {
            type: "input",
            name: "erc20name",
            message: "Name",
            default: defaults.name,
          },
          {
            type: "input",
            name: "erc20symbol",
            message: "Symbol",
            default: defaults.symbol,
          },
          {
            type: "input",
            name: "erc20decimals",
            message: "Decimals",
            default: defaults.decimals,
          },
          {
            type: "input",
            name: "erc20premint",
            message: "Premint",
            default: defaults.premint,
          },
          {
            type: "confirm",
            name: "erc20mintable",
            message: "Mintable?",
            default: defaults.mintable,
          },
          {
            type: "confirm",
            name: "erc20burnable",
            message: "Burnable?",
            default: defaults.burnable,
          },
          {
            type: "confirm",
            name: "erc20pausable",
            message: "Pausable?",
            default: defaults.pausable,
          },
          {
            type: "confirm",
            name: "erc20upgradeable",
            message: "Upgradeable?",
            default: defaults.upgradeable,
          },
          {
            type: "input",
            name: "erc20license",
            message: "License",
            default: defaults.info.license,
          },
        ];
        await this.promptAndSave(erc20prompts);
      }
    }

    const remainingPrompts = [
      {
        type: "confirm",
        name: "wantERC721",
        message: "Do you want to add an ERC721 NFT contract?",
        store: true,
      },
    ];
    if (includeAutoInstallPrompt) {
      remainingPrompts.push(autoInstallPrompt);
    }

    await this.promptAndSave(remainingPrompts);

    console.log(JSON.stringify(this.props));

    //    This.props = props;
  }

  async promptAndSave(questions) {
    this.props = {
      ...this.props,
      ...(await this.prompt(questions)),
    };
  }

  // Write the generated files
  writing() {
    // Check if framework is supported
    if (!this.supportedFrameworks.includes(this.props.framework)) {
      console.error(chalk.red(`${this.props.framework} is not supported yet.`));
      process.exit(1);
    }

    if (this.props.framework === "Nile") {
      this._copyNileSpecificFiles();
    }

    this.props.srcDir = `${this.props.outputDir}/src`;

    this._copyReadme();
    this._copyGitIgnore();

    // Smart contracts files
    if (this.props.wantERC20) {
      this._copyERC20();
    }

    if (this.props.wantERC721) {
      this._copyERC721();
    }
  }

  _copyNileSpecificFiles() {
    this.fs.copyTpl(
      this.templatePath(`Nile/requirements.txt`),
      this.destinationPath(`${this.props.outputDir}/requirements.txt`),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath(`Nile/pytest.ini`),
      this.destinationPath(`${this.props.outputDir}/pytest.ini`),
      this.props
    );
    this.fs.copyTpl(
      this.templatePath(`Nile/tests/utils.py`),
      this.destinationPath(`${this.props.outputDir}/tests/utils.py`),
      this.props
    );
    if (this.props.wantERC20) {
      this.fs.copyTpl(
        this.templatePath(`Nile/tests/test_ERC20.py`),
        this.destinationPath(`${this.props.outputDir}/tests/test_ERC20.py`),
        this.props
      );
    }

    if (this.props.wantERC721) {
      this.fs.copyTpl(
        this.templatePath(`Nile/tests/test_ERC721.py`),
        this.destinationPath(`${this.props.outputDir}/tests/test_ERC721.py`),
        this.props
      );
    }
  }

  _copyReadme() {
    this.fs.copyTpl(
      this.templatePath(`${this.props.framework}/README.md`),
      this.destinationPath(`${this.props.outputDir}/README.md`),
      this.props
    );
  }

  _copyGitIgnore() {
    this.fs.copyTpl(
      this.templatePath(".gitignore"),
      this.destinationPath(`${this.props.outputDir}/.gitignore`),
      this.props
    );
  }

  _copyERC20() {
    if (this.props.customizeERC20) {
      const erc20 = printERC20({
        name: this.props.erc20name,
        symbol: this.props.erc20symbol,
        decimals: this.props.erc20decimals,
        premint: this.props.erc20premint,
        mintable: this.props.erc20mintable,
        burnable: this.props.erc20burnable,
        pausable: this.props.erc20pausable,
        upgradeable: this.props.erc20upgradeable,
        info: {
          license: this.props.erc20license,
        },
      });
      this.fs.write(
        this.destinationPath(`${this.props.srcDir}/ERC20.cairo`),
        erc20
      );
    } else {
      this.fs.copyTpl(
        this.templatePath("contracts/ERC20.cairo"),
        this.destinationPath(`${this.props.srcDir}/ERC20.cairo`),
        this.props
      );
    }
  }

  _copyERC721() {
    this.fs.copyTpl(
      this.templatePath("contracts/ERC721.cairo"),
      this.destinationPath(`${this.props.srcDir}/ERC721.cairo`),
      this.props
    );
  }

  install() {}

  end() {
    this._goodbye();
  }

  async _greetings() {
    this.log("\n");
    this.log(
      `${chalk.magenta(
        "  ██████ ▄▄▄█████▓ ▄▄▄       ██▀███   ██ ▄█▀ ███▄    █ ▓█████▄▄▄█████▓"
      )}`
    );
    this.log(
      `${chalk.magenta(
        "▒██    ▒ ▓  ██▒ ▓▒▒████▄    ▓██ ▒ ██▒ ██▄█▒  ██ ▀█   █ ▓█   ▀▓  ██▒ ▓▒"
      )}`
    );
    this.log(
      `${chalk.magenta(
        "░ ▓██▄   ▒ ▓██░ ▒░▒██  ▀█▄  ▓██ ░▄█ ▒▓███▄░ ▓██  ▀█ ██▒▒███  ▒ ▓██░ ▒░"
      )}`
    );
    this.log(
      `${chalk.magenta(
        "  ▒   ██▒░ ▓██▓ ░ ░██▄▄▄▄██ ▒██▀▀█▄  ▓██ █▄ ▓██▒  ▐▌██▒▒▓█  ▄░ ▓██▓ ░ "
      )}`
    );
    this.log(
      `${chalk.magenta(
        "▒██████▒▒  ▒██▒ ░  ▓█   ▓██▒░██▓ ▒██▒▒██▒ █▄▒██░   ▓██░░▒████▒ ▒██▒ ░ "
      )}`
    );
    this.log(
      `${chalk.magenta(
        "▒ ▒▓▒ ▒ ░  ▒ ░░    ▒▒   ▓▒█░░ ▒▓ ░▒▓░▒ ▒▒ ▓▒░ ▒░   ▒ ▒ ░░ ▒░ ░ ▒ ░░       "
      )}`
    );
    this.log(
      `${chalk.magenta(
        "░ ░▒  ░ ░    ░      ▒   ▒▒ ░  ░▒ ░ ▒░░ ░▒ ▒░░ ░░   ░ ▒░ ░ ░  ░   ░        "
      )}`
    );
    this.log(
      `${chalk.magenta(
        "░  ░  ░    ░        ░   ▒     ░░   ░ ░ ░░ ░    ░   ░ ░    ░    ░          "
      )}`
    );
    this.log(
      `${chalk.magenta(
        "      ░                 ░  ░   ░     ░  ░            ░    ░  ░            "
      )}`
    );

    this.log("\n");

    this.log(
      `${chalk.cyan(
        "  ▄████ ▓█████  ███▄    █ ▓█████  ██▀███   ▄▄▄     ▄▄▄█████▓ ▒█████   ██▀███      "
      )}`
    );
    this.log(
      `${chalk.cyan(
        " ██▒ ▀█▒▓█   ▀  ██ ▀█   █ ▓█   ▀ ▓██ ▒ ██▒▒████▄   ▓  ██▒ ▓▒▒██▒  ██▒▓██ ▒ ██▒    "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "▒██░▄▄▄░▒███   ▓██  ▀█ ██▒▒███   ▓██ ░▄█ ▒▒██  ▀█▄ ▒ ▓██░ ▒░▒██░  ██▒▓██ ░▄█ ▒    "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "░▓█  ██▓▒▓█  ▄ ▓██▒  ▐▌██▒▒▓█  ▄ ▒██▀▀█▄  ░██▄▄▄▄██░ ▓██▓ ░ ▒██   ██░▒██▀▀█▄      "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "░▒▓███▀▒░▒████▒▒██░   ▓██░░▒████▒░██▓ ▒██▒ ▓█   ▓██▒ ▒██▒ ░ ░ ████▓▒░░██▓ ▒██▒    "
      )}`
    );
    this.log(
      `${chalk.cyan(
        " ░▒   ▒ ░░ ▒░ ░░ ▒░   ▒ ▒ ░░ ▒░ ░░ ▒▓ ░▒▓░ ▒▒   ▓▒█░ ▒ ░░   ░ ▒░▒░▒░ ░ ▒▓ ░▒▓░    "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "  ░   ░  ░ ░  ░░ ░░   ░ ▒░ ░ ░  ░  ░▒ ░ ▒░  ▒   ▒▒ ░   ░      ░ ▒ ▒░   ░▒ ░ ▒░    "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "░ ░   ░    ░      ░   ░ ░    ░     ░░   ░   ░   ▒    ░      ░ ░ ░ ▒    ░░   ░     "
      )}`
    );
    this.log(
      `${chalk.cyan(
        "      ░    ░  ░         ░    ░  ░   ░           ░  ░            ░ ░     ░         "
      )}`
    );
    this.log(
      yosay(`${chalk.magenta("GM")} from ${chalk.green("starknet")} generator!`)
    );
  }

  _goodbye() {
    this.log(yosay(`Bye! Enjoy building on ${chalk.green("starknet")}!`));
    this.log(`Go to project: ${chalk.green(`cd ${this.props.outputDir}`)}`);
    this.log(
      `Follow the instructions on ${chalk.blue(
        "README.MD"
      )} to setup, compile and tests the contracts.`
    );
  }
};
