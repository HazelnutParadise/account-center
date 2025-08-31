<script setup>
const router = useRoute();
const action = router.params.action;
onMounted(() => window.location.reload());
</script>

<template>
    <div>
        <h1>正在{{ action === 'sign-in' ? '登入' : '登出' }}</h1>
    </div>
</template>