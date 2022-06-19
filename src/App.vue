<template>
    <div class="container my-3">
        <div class="card">
            <div class="card-header">
                xmr.gift: Gift cards generator
            </div>
            <div class="card-body">
                <settings-form @submit="generateCards"></settings-form>
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
    import base58 from "base58-monero"
    import { jsPDF } from "jspdf"
    import qrcode from "qrcode"
    import grid from "./grid.js"

    const cardWidth = 85.6
    const cardHeight = 53.98

    const qrSize = 34.4
    const qrMargin = 2

    const pageConfig = {
        a4: {
            grid: [
                [{}, {}],
                [{}, {}],
                [{}, {}],
                [{}, {}],
            ],
            margin: 12.5,
        },
        letter: {
            grid: [
                [{}, {}],
                [{}, {}],
                [{}, {}],
                [{}, {}],
            ],
            margin: 14.5,
        }
    }

    export default {
        name: "App",

        data() {
            return {
                error: "",
                template: "",
                pageFormat: "",
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

            generateCards(form, frontImage, backImage) {
                const template = form.elements["template"].value
                const pageFormat = form.elements["paper_format"].value

                const n = parseInt(form.elements["cards"].value)
                const walletType = form.elements["wallet_type"].value

                if (walletType === "online") {
                    const restoreHeight = form.elements["restore_height"].value

                    this.generateWallets(template, frontImage, backImage, pageFormat, restoreHeight, n)
                } else {
                    this.generateMnemonics(template, pageFormat, n)
                }
            },

            async generateWallets(template, frontImage, backImage, pageFormat, restoreHeight, n) {
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const privateSpendKey = await wallet.getPrivateSpendKey()
                    const privateSpendKeyB58 = base58.encode(Buffer.from(privateSpendKey, "hex"))
                    const uri = "https://xmr.gift/wallet/#s="+privateSpendKeyB58+"&h="+restoreHeight
                    wallets.push(uri)
                }
                this.template = template
                this.frontImage = frontImage
                this.backImage = backImage
                this.pageFormat = pageFormat
                this.wallets = wallets
            },

            async generateMnemonics(template, pageFormat, n) {
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const mnemonic = await wallet.getMnemonic()
                    wallets.push(mnemonic)
                }
                this.template = template
                this.pageFormat = pageFormat
                this.wallets = wallets
            },
        },

        watch: {
            async wallets(newWallets) {
                const pdf = new jsPDF({
                    format: this.pageFormat,
                })
                pdf.deletePage(1)

                const addCardGrid = async function(grid, pageFormat, image, margin, withQR) {
                    pdf.addPage(pageFormat)

                    for(let rowID in grid) {
                        for(let colID in grid[rowID]) {
                            let x = ((cardWidth + margin) * colID) + margin
                            let y = ((cardHeight + margin) * rowID) + margin
                            // TODO: optimize image loading - fetch each side exactly once!
                            pdf.addImage(image, "PNG", x, y, cardWidth, cardHeight)

                            if(withQR) {
                                let qr = await qrcode.toDataURL(grid[rowID][colID], {
                                    errorCorrectionLevel: 'L',
                                    // width requires value in pixels. We upscale the value in mm by a factor.
                                    width: qrSize*5,
                                    margin: qrMargin,
                                })
                                pdf.addImage(qr, x+48, y+13, qrSize, qrSize)
                            }
                        }
                    }
                }

                const cardMargin = pageConfig[this.pageFormat].margin
                const gridTemplate = pageConfig[this.pageFormat].grid

                const walletsTotal = newWallets.length
                const cardsPerPage = grid.count(gridTemplate)

                let pageGrids = []
                for(let i = 0; i < walletsTotal; i += cardsPerPage) {
                    let wallets = newWallets.slice(i, i+cardsPerPage)
                    let pageGrid = grid.fromArray(gridTemplate, wallets)
                    pageGrids.push(pageGrid)
                }

                for(let pageGrid of pageGrids) {
                    await addCardGrid(pageGrid, this.pageFormat, this.frontImage, cardMargin, false)
                    await addCardGrid(pageGrid, this.pageFormat, this.backImage, cardMargin, true)
                }

                pdf.save("gift-cards.pdf")
            },
        },
    }
</script>
