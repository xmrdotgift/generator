<template>
    <div class="container my-3 d-print-none">
        <div class="card">
            <div class="card-header">
                xmr.gift: Monero gift cards generator
            </div>
            <div class="card-body">
                <settings-form @submit="generateCards" @print="printWindow"></settings-form>
            </div>
        </div>
    </div>

    <div v-for="page in parseInt((wallets.length*2) / 8)" class="container-fluid">
        <div class="row">
            <div v-if="(page-1) % 2 === 0" v-for="i in 8" class="col-6 p-3 text-center">
                <card side="front" rounded="true" :template="template"></card>
            </div>
            <div v-if="(page-1) % 2 !== 0" v-for="i in 8" class="col-6 p-3 text-center">
                <card side="back" rounded="true" :template="template" :text="wallets[((i-1) + parseInt(page/2) * 8) - 8]"></card>
            </div>
        </div>
    </div>
</template>

<style scoped>
    @page {
        margin:5px;
    }
</style>

<script>
    import monerojs from "monero-javascript"

    export default {
        name: "App",

        data() {
            return {
                template: "",
                wallets: [],
            }
        },

        methods: {
            async newWallet() {
                return await monerojs.createWalletKeys({
                    language: 'English',
                    networkType: monerojs.MoneroNetworkType.STAGENET,
                    // Password cannot be empty a dummy password will do.
                    password: 'walletPassword',
                })
            },

            generateCards(form) {
                this.template = form.elements["template"].value
                const n = parseInt(form.elements["cards"].value)
                const walletType = form.elements["wallet_type"].value

                if (walletType === "online") {
                    this.generateWallets(n)
                } else {
                    this.generateMnemonics(n)
                }
            },

            printWindow() {
                window.print()
            },

            async generateWallets(n) {
                this.wallets = []
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const privateSpendKey = await wallet.getPrivateSpendKey()
                    wallets.push("https://xmr.gift/wallet/#"+privateSpendKey)
                }
                this.wallets = wallets
            },

            async generateMnemonics(n) {
                this.wallets = []
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const mnemonic = await wallet.getMnemonic()
                    wallets.push(mnemonic)
                }
                this.wallets = wallets
            },
        },
    }
</script>
