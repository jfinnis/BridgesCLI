import { Command } from 'commander'
import { Box, render, Text } from 'ink'

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

const CircleWithNumber = () => (
    <Box flexDirection="column" alignItems="center">
        <Text>┏━┓</Text>
        <Text>┃4┃</Text>
        <Text>┗━┛</Text>
    </Box>
)

const App = () => (
    <Box
        borderStyle="single"
        borderColor="white"
        width={60}
        height={20}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
    >
        <CircleWithNumber />
    </Box>
)

if (options.stdout) {
    const instance = render(<App />)
    instance.unmount()
} else {
    render(<App />)
}
