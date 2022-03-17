<template>
    <div class="container my-3 d-print-none">
        <div class="alert alert-danger" v-if="error">
            <p class="mb-0" v-if="error === ErrNoRestoreHeight">Restore height isn't known yet.</p>
        </div>
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

        created() {
            this.ErrNoRestoreHeight = "no restore height"
        },

        data() {
            return {
                error: "",
                template: "",
                restoreHeight: 0,
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
                const restoreHeight = this.restoreHeight
                const walletType = form.elements["wallet_type"].value

                if (restoreHeight === 0) {
                    this.error = this.ErrNoRestoreHeight
                    return
                }

                if (walletType === "online") {
                    this.generateWallets(n, restoreHeight)
                } else {
                    this.generateMnemonics(n)
                }
            },

            printWindow() {
                window.print()
            },

            async generateWallets(n, restoreHeight) {
                this.wallets = []
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const privateSpendKey = await wallet.getPrivateSpendKey()
                    const uri = "https://xmr.gift/wallet/?h="+restoreHeight+"#"+privateSpendKey
                    wallets.push(uri)
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

        async mounted() {
            const wallet = await monerojs.connectToDaemonRpc({
                uri: "https://node.xmr.gift",
                pollInterval: 10000,
            })
            this.restoreHeight = await wallet.getHeight()

            const that = this
            await wallet.addListener(new class extends monerojs.MoneroDaemonListener {
                onBlockHeader(header) {
                    that.restoreHeight = header.getHeight()
                }
            })
        },
    }
</script>
