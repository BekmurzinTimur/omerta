<script lang="ts" module>
	import { Button } from 'bits-ui';
	// Define your toast data.
	type ToastData = {
		title: string;
		description: string;
	};

	const toaster = new Toaster<ToastData>({ closeDelay: 5000 });

	export const addToast = toaster.addToast;
</script>

<script lang="ts">
	import { Toaster } from 'melt/builders';
</script>

<div
	{...toaster.root}
	class="absolute top-auto right-4 bottom-4 left-auto flex h-fit w-[300px] flex-col gap-4 overflow-visible bg-transparent bg-none text-white"
>
	{#each toaster.toasts as toast (toast.id)}
		<div
			{...toast.content}
			class="relative flex h-[--toast-height] w-full flex-col justify-center rounded-xl bg-transparent p-4 px-4 text-left shadow shadow-white/20 transition dark:bg-gray-800"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-xl font-bold" {...toast.title}>{toast.data.title}</h3>
				<Button.Root
					class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex
h-12 items-center justify-center 
font-semibold active:scale-[0.98] active:transition-all"
					{...toast.close}
					aria-label="dismiss alert"
				>
					Close
				</Button.Root>
			</div>
			<div {...toast.description}>{toast.data.description}</div>
		</div>
	{/each}
</div>
