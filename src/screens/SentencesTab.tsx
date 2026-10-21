import { GroupGrid } from '../components/GroupGrid'
import { TabShell } from '../components/TabShell'

/** Sentences tab: tricky words learned by sight, then words strung together into sentences. */
export function SentencesTab() {
  return (
    <TabShell tab="sentences" title="Sentences">
      <GroupGrid tab="sentences" />
    </TabShell>
  )
}
