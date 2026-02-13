import { Command } from 'commander'
import { Box, render } from 'ink'
import { HashiRow } from './components/HashiRow.tsx'

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
            <HashiRow
                length={5}
                nodes={[
                    { position: 0, value: 1 },
                    { position: 2, value: 2 },
                    { position: 4, value: 3 },
                ]}
            />
        </Box>
    )
}

if (options.stdout) {
    const instance = render(<App />)
    instance.unmount()
} else {
    render(<App />)
}
