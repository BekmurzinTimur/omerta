<script lang="ts">
	let { className, text }: { className?: string; text?: string } = $props();
</script>

<span
	class={'inline-flex size-5 flex-col items-center justify-center  rounded-full bg-red-500 text-xs text-white' +
		(className ? ' ' + className : '')}
>
	{text}
</span>
