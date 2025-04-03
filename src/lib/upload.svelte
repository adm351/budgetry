<script lang="ts">
	import {
		Button,
		ButtonGroup,
		Fileupload,
		Input,
		InputAddon,
		Label,
		Modal,
		Select,
		Table,
		TableBodyCell,
		TableBodyRow,
		TableHead,

		TableHeadCell
	} from 'flowbite-svelte';
	import { CheckCircleOutline } from 'flowbite-svelte-icons';
	import { BudgetItems, ComputeHistory, type Item } from './store';
	import { get } from 'lodash';

	let done = false;

	let mappingModal = false;

	let lines: string[][];

	let mappingRow = 1;

  let mappings: string[] = []

  $: isMapped = mappings.includes('TransactionDate') && mappings.includes('Amount') && mappings.includes('Title')

	const fileUploaded = (evt: any) => {
		var reader = new FileReader();
		reader.readAsText(evt.target.files[0], 'UTF-8');
		reader.onload = (loaded: any) => {
			lines = loaded.target.result.split('\r\n').map((row: string) => row.split(','));
			mappingModal = true;
      evt.target.value = null
		}
	};

  const handleMapping = () => {
    const items: Item[] = lines.filter((row: any) => row[mappings.indexOf('TransactionDate')] && row[mappings.indexOf('Amount')] && row[mappings.indexOf('Title')] && parseFloat(row[mappings.indexOf('Amount')]) < 0).map((row: string[]) => ({
      TransactionDate: new Date(row[mappings.indexOf('TransactionDate')]).getTime(),
      Amount: parseFloat(row[mappings.indexOf('Amount')]),
      Title: row[mappings.indexOf('Title')].replaceAll('"', ''),
      Groups: []
    }))
    BudgetItems.set([...$BudgetItems, ...items])
    done = true
    setTimeout(() => {
      done = false
    }, 3000)
    mappings = []
    ComputeHistory()
    mappingModal = false;
  }
</script>

<div class="flex flex-row items-end fixed top-0 left-0 w-1/2 p-2 z-99 bg-white border-r border-gray-300 border-b">
  <div class="w-full mr-3">
    <Label for="with_helper">Upload a CSV of transactions</Label>
    <div class="relative">
      <Fileupload id="with_helper" on:change={fileUploaded} class="h-10" />
      <Label
        class={`absolute right-2 bottom-3 whitespace-nowrap flex ${done ? 'opacity-100' : 'opacity-0'} transition-opacity`}
        ><CheckCircleOutline class="mr-1" />Uploaded</Label
      >
    </div>
  </div>
  <Button
      class="h-10"
      on:click={() => {
        BudgetItems.set([])
      }}>Clear</Button
    >
</div>
<div class="pb-16"></div>

<Modal title="Map a new CSV File" bind:open={mappingModal} on:close={() => { mappings = [] }}>
	<Table class="border border-gray-200">
		<TableHead>
			<TableBodyCell>
				Example Data:
			</TableBodyCell>
			<TableBodyCell>Mapping:</TableBodyCell>
		</TableHead>
		{#each lines[mappingRow] as column, idx}
			<TableBodyRow>
				<TableBodyCell>
					{column}
				</TableBodyCell>
				<TableBodyCell>
					<Select
            bind:value={mappings[idx]}
            placeholder="Select Mapping..."
						items={[
							{
								name: 'Ignore',
								value: ''
							},
              {
								name: 'Transaction Date',
								value: 'TransactionDate'
							},
              {
								name: 'Transaction Amount',
								value: 'Amount'
							},
              {
								name: 'Transaction Name',
								value: 'Title'
							}
						]}
					/>
				</TableBodyCell>
			</TableBodyRow>
		{/each}
    <TableHead>
      <TableHeadCell colspan={2}>
        <ButtonGroup>
          <InputAddon>Row</InputAddon>
          <Input type="number" bind:value={mappingRow} min={0} max={lines.length-1} step={1} />
        </ButtonGroup>
      </TableHeadCell>
    </TableHead>
	</Table>
	<svelte:fragment slot="footer">
		<Button on:click={handleMapping} disabled={!isMapped}>Add Mapped Transactions</Button>
		<Button color="alternative" on:click={() => { 
      mappings = []
      mappingModal = false 
    }}>Cancel</Button>
	</svelte:fragment>
</Modal>
