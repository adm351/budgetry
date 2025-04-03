<script lang="ts">
	import Date from '$lib/date.svelte';
	import Groupings from '$lib/groupings.svelte';
	import { BudgetItems, ComputeHistory, Dates, Filter } from '$lib/store';
	import Upload from '$lib/upload.svelte';
	import {
		Accordion,
		AccordionItem,
		Alert,
		Badge,
		Button,
		Label,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let assigned = $derived($BudgetItems.filter(
			(item) =>
				item.Groups.length === 1 &&
				item.TransactionDate > $Filter.FirstDate &&
				item.TransactionDate < $Filter.LastDate
		))
	let assignedTotal = $derived(assigned.reduce((acc: number, item) => {
			acc = acc - item.Amount;
			return acc;
		}, 0))
	let unassigned = $derived(
		$BudgetItems.filter(
			(item) =>
				item.Groups.length === 0 &&
				item.TransactionDate > $Filter.FirstDate &&
				item.TransactionDate < $Filter.LastDate
		)
	);
	let unassignedTotal = $derived(
		unassigned.reduce((acc: number, item) => {
			acc = acc - item.Amount;
			return acc;
		}, 0)
	);
	let overassigned = $derived(
		$BudgetItems.filter(
			(item) =>
				item.Groups.length > 1 &&
				item.TransactionDate > $Filter.FirstDate &&
				item.TransactionDate < $Filter.LastDate
		)
	);
	let overassignedTotal = $derived(
		overassigned.reduce((acc: number, item) => {
			acc = acc - item.Amount;
			return acc;
		}, 0)
	);

	onMount(() => {
		ComputeHistory();
	});

	let welcomeDismissed: boolean = $state(false)

</script>

{#if !welcomeDismissed}
	<div class="w-screen h-screen flex justify-center items-center bg-center bg-cover" style="background-image: url('/fabian-blank-pElSkGRA2NU-unsplash.webp');">
		<div class="border border-gray-300 rounded p-6 w-full max-w-120 shadow text-gray-600 bg-white">
			<h1 class="text-2xl mb-4 border-gray-300 border-b pb-4 text-center text-black">BUDGETRY</h1>
			<p>This simple app lets you upload and map multiple CSV files containing banking transactions. You can create groups that let you categoriese spending and allows you to filter by a date range.</p>
			<ul class="list-disc ml-5 mt-2">
				<li>ALL information is private, it stays in your browser.</li>
				<li>NO data is transmitted back to our servers.</li>
				<li>Data IS stored in your browsers "Local Storage" so that you can come back to it later.</li>
			</ul>
			<div class="text-center my-4">
				<Button on:click={() => { welcomeDismissed = true }}>OK - Start Grouping Transactions</Button>
			</div>
			<p class="text-sm text-gray-600 text-center">By <a href="https://sinewavedesign.com.au" class="underline">sinewavedesign</a></p>
		</div>
	</div>
{:else}
	<section class="min-h-screen w-screen flex">
		<div class="w-1/2 border-r border-gray-300 p-2 h-screen overflow-y-scroll">
			<Upload />
			<Table>
				<TableBodyRow>
					<TableHeadCell>First Transaction:</TableHeadCell>
					<TableBodyCell>
						<Date time={$Dates.FirstDate} />
					</TableBodyCell>
					<TableHeadCell>Last Transcation:</TableHeadCell>
					<TableBodyCell>
						<Date time={$Dates.LastDate} />
					</TableBodyCell>
				</TableBodyRow>
			</Table>
			<Accordion>
				<AccordionItem>
					<div slot="header" class="w-full flex flex-row justify-between">
						Assigned
						<div class="mr-3">
							<Badge color="green">Items:{assigned.length}</Badge>
							<Badge color="blue">Total: ${assignedTotal.toFixed(2)}</Badge>
						</div>
					</div>
					<div class="-m-5">
						<Table class="table-fixed w-full">
							<TableHead>
								<TableHeadCell class="text-left w-24">DATE</TableHeadCell>
								<TableHeadCell class="text-left">NAME</TableHeadCell>
								<TableHeadCell class="w-20 text-right">VALUE</TableHeadCell>
								<TableHeadCell class="w-20">GROUPS</TableHeadCell>
							</TableHead>
							<TableBody>
								{#each assigned as item}
									<TableBodyRow>
										<TableBodyCell>
											<Date time={item.TransactionDate} />
										</TableBodyCell>
										<TableBodyCell class="truncate">
											{item.Title}
										</TableBodyCell>
										<TableBodyCell class="text-right">
											${item.Amount}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											<Badge color={item.Groups.length === 1 ? 'green' : 'red'}
												>{item.Groups.length}</Badge
											>
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</AccordionItem>
				<AccordionItem>
					<div slot="header" class="w-full flex flex-row justify-between">
						Unassigned
						<div class="mr-3">
							<Badge color="green">Items:{unassigned.length}</Badge>
							<Badge color="blue">Total: ${unassignedTotal.toFixed(2)}</Badge>
						</div>
					</div>
					<div class="-m-5">
						<Table class="table-fixed w-full">
							<TableHead>
								<TableHeadCell class="text-left w-24">DATE</TableHeadCell>
								<TableHeadCell class="text-left">NAME</TableHeadCell>
								<TableHeadCell class="w-20 text-right">VALUE</TableHeadCell>
								<TableHeadCell class="w-20">GROUPS</TableHeadCell>
							</TableHead>
							<TableBody>
								{#each unassigned as item}
									<TableBodyRow>
										<TableBodyCell>
											<Date time={item.TransactionDate} />
										</TableBodyCell>
										<TableBodyCell class="truncate">
											{item.Title}
										</TableBodyCell>
										<TableBodyCell class="text-right">
											${item.Amount}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											<Badge color={item.Groups.length === 1 ? 'green' : 'red'}
												>{item.Groups.length}</Badge
											>
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</AccordionItem>
				<AccordionItem>
					<div slot="header" class="w-full flex flex-row justify-between">
						Overassigned
						<div class="mr-3">
							<Badge color="green">Items:{overassigned.length}</Badge>
							<Badge color="blue">Total: ${overassignedTotal.toFixed(2)}</Badge>
						</div>
					</div>
					<div class="-m-5">
						<Table class="table-fixed w-full">
							<TableHead>
								<TableHeadCell class="text-left w-24"><Label>DATE</Label></TableHeadCell>
								<TableHeadCell class="text-left"><Label>NAME</Label></TableHeadCell>
								<TableHeadCell class="w-20 text-right"><Label>VALUE</Label></TableHeadCell>
								<TableHeadCell class="w-20"><Label>GROUPS</Label></TableHeadCell>
							</TableHead>
							<TableBody>
								{#each overassigned as item}
									<TableBodyRow>
										<TableBodyCell>
											<Date time={item.TransactionDate} />
										</TableBodyCell>
										<TableBodyCell class="truncate">
											{item.Title}
										</TableBodyCell>
										<TableBodyCell class="text-right">
											${item.Amount}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{item.Groups}
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				</AccordionItem>
			</Accordion>
		</div>
		<div class="w-1/2 p-2 h-screen overflow-y-scroll">
			<Groupings />
			<div class="pb-16"></div>
			<div class="bg-gray-200 fixed bottom-0 right-0 w-1/2 p-5 text-right text-gray-600">
				Total Spend Between <Date time={$Filter.FirstDate}/> - <Date time={$Filter.LastDate}/>: <b class="text-black">${assignedTotal.toFixed(2)}</b>
			</div>
		</div>
	</section>
{/if}
