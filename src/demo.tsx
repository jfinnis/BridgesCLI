#!/usr/bin/env -S bun run

import { render } from 'ink'

import HashiRow from './components/HashiRow.tsx'

render(<HashiRow nodes={[{ value: 1 }, { value: '-' }, { value: 2 }, { value: '#' }, { value: 2 }, { value: 3 }]} highlightedNode={2} />)
