import { Command } from 'commander'
import { render } from 'ink'

import HashiGrid from './components/HashiGrid.tsx'

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
        <HashiGrid
            numNodes={5}
            rows={[
                [
                    { position: 0, value: 3 },
                    { position: 2, value: 2 },
                ],
                [
                    { position: 1, value: 1 },
                    { position: 2, value: 3 },
                    { position: 3, value: 2 },
                ],
                [
                    { position: 3, value: 1 },
                    { position: 4, value: 1 },
                ],
                [
                    { position: 0, value: 4 },
                    { position: 4, value: 3 },
                ],
            ]}
        />
    )
}

if (options.stdout) {
    const instance = render(<App />)
    instance.unmount()
} else {
    render(<App />)
}
