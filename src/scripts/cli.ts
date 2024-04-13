#!/usr/bin/env node

const chalk = require('chalk')
import { updateConfig } from '../common/config'
import csvExport from '../integrations/csv-export/setup'
import csvImport from '../integrations/csv-import/setup'
import google from '../integrations/google/setup'
import plaidAccountSetup from '../integrations/plaid/accountSetup'
import plaid from '../integrations/plaid/setup'
import tellerAccountSetup from '../integrations/teller/accountSetup'
import teller from '../integrations/teller/setup'
import fetch from './fetch'
import migrate from './migrate'

const usage = () => {
    console.log(`\nmintable v${require('../../package.json').version}`)
    console.log('usage:\tmintable migrate')
    console.log('usage:\tmintable fetch')
    console.log('usage:\tmintable setup <targets> [accounts]')
    console.log(' where <targets> are one or more of:')
    console.log('\tdefault, reset, plaid, teller, google, from-csv, to-csv')
    console.log('Repeating "mintable setup" accumulates changes to the configuration,')
    console.log(' and "mintable reset" clears the configuration.')
    console.log('A bare "mintable setup" means "mintable setup default"')
}

const addAccounts = async () => {
    // check config for plaid and teller
    await plaidAccountSetup()
    await tellerAccountSetup()
}

const resetConfig = async () => {
    await updateConfig(config => config, true)
}

const defaultSetup = async () => {
    // same as: setup reset plaid google accounts
    await resetConfig()
    await plaid()
    await google()
    await addAccounts()
}

const setup = async (args: string[]) => {
    if (args.length == 0) {
        await defaultSetup()
    } else {
        for (const arg of args) {
            switch (arg) {
                case 'reset':
                    await resetConfig()
                    break
                case 'plaid':
                    await plaid()
                    break
                case 'teller':
                    await teller()
                    break
                case 'google':
                    await google()
                    break
                case 'from-csv':
                    await csvImport()
                    break
                case 'to-csv':
                    await csvExport()
                    break
                case 'accounts':
                    await addAccounts()
                    break
                case 'default':
                    defaultSetup()
                    break
                default:
                    usage()
            }
        }
    }
}
;(async function() {
    const logo = [
        '\n',
        '          %',
        '          %%',
        '         %%%%%',
        '       %%%%%%%%',
        '     %%%%%%%%%%',
        '   %%%%%%%%%%%%',
        '  %%%% %%%%%%%%',
        '  %%%  %%%%%%',
        '  %%   %%%%%%',
        '   %   %%%',
        '        %%%',
        '         %%',
        '           %',
        '\n'
    ]

    logo.forEach(line => {
        console.log(chalk.green(line))
    })
    console.log(' M I N T A B L E\n')

    const cmd = process.argv[2]
    const args = process.argv.slice(3)
    switch (cmd) {
        case 'setup':
            setup(args)
            break
        case 'migrate':
            migrate()
            break
        case 'fetch':
            fetch()
            break
        default:
            usage()
    }
})()
