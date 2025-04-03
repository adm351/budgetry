<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Badge,
		Button,
		Datepicker,
		Input,
		Label,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Textarea
	} from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import { get } from 'svelte/store';
	import DateDisplay from './date.svelte';
	import { ComputeHistory, Dates, Filter, Groupings, type Grouping } from './store';

	const handleSubmit = (evt: any, key?: string) => {
		evt.preventDefault();
		const formData = new FormData(evt.target);
		const data: any = Object.fromEntries(formData);
		const grouping: Grouping = {
			Label: data.Label,
			Rules: data.Rules.split('\n').reduce((acc:string[], item: string) => {
        if(item.trim() !== '') acc.push(item.trim())
        return acc
      }, []),
			Total: 0,
			Items: []
		};
		Groupings.set({
			...$Groupings,
			[key || self.crypto.randomUUID()]: grouping
		});
		ComputeHistory();
		if (showForm === 'new') evt.target.reset();
		showForm = '';
	};

	let showForm: string = '';

  let from: Date
  let to: Date

  const handleFilterChange = () => {
    if(from && to) {
      Filter.set({FirstDate: from.getTime(), LastDate: to.getTime()})
      ComputeHistory()
    }
  }

  const handleClear = () => {
    const dates = get(Dates)
    Filter.set({FirstDate: dates.FirstDate, LastDate: dates.LastDate})
    ComputeHistory()
  }

</script>

<div class="flex flex-row items-end fixed top-0 right-0 w-1/2 p-2 z-99 bg-white border-gray-300 border-b">
  <div class="w-full mr-3">
    <Label>Filter by Date:</Label>
    <Datepicker inputClass="h-10 w-full mr-2" showActionButtons on:clear={handleClear} range bind:rangeFrom={from} bind:rangeTo={to} on:select={handleFilterChange} />
  </div>
  <Button
      class={showForm === 'new' ? 'hidden' : 'whitespace-nowrap h-10'}
      on:click={() => {
        showForm = 'new';
      }}>Add Grouping</Button
    >
</div>
<div class="pb-16"></div>
<form class="p-2" on:submit|preventDefault={handleSubmit}>
	<div class={showForm === 'new' ? '' : 'hidden'}>
		<div>
			<Label>Label:</Label>
			<Input type="text" name="Label" required />
		</div>
		<div>
			<Label>Rules:</Label>
			<Textarea name="Rules" required class="h-36" />
		</div>
		<Button type="submit">Add and Calculate</Button>
		<Button color="alternative" on:click={() => { showForm = '' }}>Cancel</Button>
	</div>
</form>
<Accordion>
	{#each Object.keys($Groupings).sort((a, b) => $Groupings[b].Total - $Groupings[a].Total) as key}
		<AccordionItem open={showForm === key}>
			<div slot="header" class="flex w-full mr-3 flex-row items-center justify-between -m-3">
				{$Groupings[key].Label}
				<div class="items-center flex">
          <Badge color="green">Items: {$Groupings[key].Items.length}</Badge>
					<Badge color="blue" class="mx-2">Total: ${$Groupings[key].Total.toFixed(2)}</Badge>
					<Button
						color="alternative"
						disabled={showForm === key}
						size="xs"
						on:click={(e) => {
							e.stopPropagation();
							showForm = showForm === key ? '' : key;
						}}><EditOutline /></Button
					>
				</div>
			</div>
      <div class="-m-5">
        <form
          class={`${showForm === key ? 'p-2' : ' hidden'}`}
          on:submit|preventDefault={(e) => handleSubmit(e, key)}
        >
          <div>
            <Label>Label:</Label>
            <Input type="text" name="Label" required value={$Groupings[key].Label} />
          </div>
          <div class="mt-2">
            <Label>Rules:</Label>
            <Textarea name="Rules" required class="h-36" value={$Groupings[key].Rules.join('\n')} />
          </div>
          <Button type="submit" class="w-full block" size="sm">Update and Calculate</Button>
        </form>
        <Table class="table-fixed">
          <TableHead>
            <TableHeadCell class="w-26">Date</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell class="w-30">Value</TableHeadCell>
          </TableHead>
          <TableBody>
            {#each $Groupings[key].Items as item}
              <TableBodyRow>
                <TableBodyCell>
                  <DateDisplay time={item.TransactionDate}/>
                </TableBodyCell>
                <TableBodyCell class="truncate">
                  {item.Title}
                </TableBodyCell>
                <TableBodyCell class="text-right">
                  ${item.Amount}
                </TableBodyCell>
              </TableBodyRow>
            {/each}
            <TableBodyRow>
              <TableBodyCell colspan={2}>Total</TableBodyCell>
              <TableBodyCell>${$Groupings[key].Total.toFixed(2)}</TableBodyCell>
            </TableBodyRow>
          </TableBody>
        </Table>
      </div>
		</AccordionItem>
	{/each}
</Accordion>
