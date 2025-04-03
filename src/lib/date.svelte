<script lang="ts">
  export let time: number
  let dateTime = new Date(time)
</script>

<span>{dateTime.toLocaleDateString()}</span>