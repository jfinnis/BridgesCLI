import { Command } from 'commander'
import { Box, render } from 'ink'
import { HashiNode } from './HashiNode.js'

type CliOptions = {
    stdout: boolean
}

const program = new Command()

program
    .name('hashi')
    .description('Hashi puzzle game')
    .option('-s, --stdout', 'Output to stdout and exit (for testing)')
    .parse(process.argv)

const options = program.opts<CliOptions>()

function App() {
    return (
        <Box
            borderStyle="single"
            borderColor="white"
            width={60}
            height={20}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
        >
            <HashiNode />
        </Box>
    )
}

if (options.stdout) {
    const instance = render(<App />)
    instance.unmount()
} else {
    render(<App />)
}
