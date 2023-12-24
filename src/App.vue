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
            format: "a4",
            grid: [
                [{}, {}],
                [{}, {}],
                [{}, {}],
                [{}, {}],
            ],
            margin: 12.5,
            card_margin: 12.5
        },
        a4_compact: {
            format: "a4",
            grid: [
                [{}, {}],
                [{}, {}],
                [{}, {}],
                [{}, {}],
            ],
            margin: 18.25,
            card_margin: 1.0
        },
        letter: {
            format: "letter",
            grid: [
                [{}, {}],
                [{}, {}],
                [{}, {}],
                [{}, {}],
            ],
            margin: 14.5,
            card_margin: 14.5
        }
    }

    export default {
        name: "App",

        data() {
            return {
                error: "",
                template: "",
                pageFormat: "",
                cuttingGuides: "",
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
                const cuttingGuides = form.elements["cutting_guides"].value

                const n = parseInt(form.elements["cards"].value)
                const walletType = form.elements["wallet_type"].value
                const restoreHeight = form.elements["restore_height"].value

                if (walletType === "online") {
                    this.generateWallets(restoreHeight, n)
                } else if (walletType === "mnemonic") {
                    this.generateMnemonics(restoreHeight, n)
                }else if (walletType === "monero_wallet") {
                    this.generateWalletScheme(restoreHeight, n)
                }
                // Assign generation parameters
                this.template = template
                this.frontImage = frontImage
                this.backImage = backImage
                this.pageFormat = pageFormat
                this.cuttingGuides = cuttingGuides
            },

            async generateWallets(restoreHeight, n) {
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const privateSpendKey = await wallet.getPrivateSpendKey()
                    const privateSpendKeyB58 = base58.encode(Buffer.from(privateSpendKey, "hex"))
                    const uri = "https://xmr.gift/wallet/#s="+privateSpendKeyB58+"&h="+restoreHeight
                    wallets.push(uri)
                }

                this.wallets = wallets
            },

            async generateMnemonics(restoreHeight, n) {
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const mnemonic = await wallet.getMnemonic()
                    wallets.push(mnemonic)
                }
                this.wallets = wallets
            },

            async generateWalletScheme(restoreHeight, n) {
                let wallets = []
                for (let i = 0; i < n; i++) {
                    const wallet = await this.newWallet()
                    const mnemonic = await wallet.getMnemonic()
                    const encoded_mnemonic = encodeURI(mnemonic)
                    const uri = "monero_wallet:?seed=" + encoded_mnemonic + "&height=" + restoreHeight
                    wallets.push(uri)
                }
                this.wallets = wallets
            },
        },

        watch: {
            async wallets(newWallets) {
                // Params for initializing jsPDF
                const format = pageConfig[this.pageFormat].format
                // Initialize jsPDF
                const pdf = new jsPDF({
                    format: format,
                })
                pdf.deletePage(1)

                const addCardGrid = async function(grid, pageFormat, image, margin, card_margin, withQR, cuttingGuides) {
                    pdf.addPage(pageFormat)
                    // Set Dashed Line Color - Gray
                    pdf.setDrawColor("#D0D0D0");

                    let isFirstRow = true

                    for(let rowID in grid) {
                        for(let colID in grid[rowID]) {
                            let x = ((cardWidth + card_margin) * colID) + margin
                            let y = ((cardHeight + card_margin) * rowID) + margin
                            // TODO: optimize image loading - fetch each side exactly once!
                            //console.info("Add Image:", x, y)
                            pdf.addImage(image, "PNG", x, y, cardWidth, cardHeight)

                            if(cuttingGuides === "dashed_line"){
                                // Add dashed lines between colon's
                                {
                                    let xFrom = ((cardWidth + card_margin) * colID) + margin - (card_margin / 2)
                                    let yFrom = ((cardHeight + card_margin) * rowID) + margin + cardHeight + (card_margin / 2)
                                    let xTo   = ((cardWidth + card_margin) * colID) + margin + cardWidth + (card_margin / 2)
                                    let yTo   = ((cardHeight + card_margin) * rowID) + margin + cardHeight + (card_margin / 2)
                                    //console.info("Add DottedLine:", xFrom, yFrom, xTo, yTo)
                                    dottedLine(pdf, xFrom, yFrom, xTo, yTo, 2)
                                }

                                // Add dashed lines between row's
                                {
                                    let xFrom = ((cardWidth + card_margin) * colID) + margin + cardWidth + (card_margin / 2)
                                    let yFrom = ((cardHeight + card_margin) * rowID) + margin - (card_margin / 2)
                                    let xTo   = ((cardWidth + card_margin) * colID) + margin + cardWidth + (card_margin / 2)
                                    let yTo   = ((cardHeight + card_margin) * rowID) + margin + cardHeight + (card_margin / 2)
                                    //console.info("Add DottedLine:", xFrom, yFrom, xTo, yTo)
                                    dottedLine(pdf, xFrom, yFrom, xTo, yTo, 2)
                                }

                                if(isFirstRow) {
                                    // Add first dashed lines for row's
                                    let xFrom = ((cardWidth + card_margin) * colID) + margin - (card_margin / 2)
                                    let yFrom = ((cardHeight + card_margin) * rowID) + margin - (card_margin / 2)
                                    let xTo   = ((cardWidth + card_margin) * colID) + margin + cardWidth + (card_margin / 2)
                                    let yTo   = ((cardHeight + card_margin) * rowID) + margin - (card_margin / 2)
                                    //console.info("Add DottedLine:", xFrom, yFrom, xTo, yTo)
                                    dottedLine(pdf, xFrom, yFrom, xTo, yTo, 2)
                                }
                            }
                            if(withQR) {
                                let qr = await qrcode.toDataURL(grid[rowID][colID], {
                                    errorCorrectionLevel: 'L',
                                    // width requires value in pixels. We upscale the value in mm by a factor.
                                    width: qrSize*5,
                                    margin: qrMargin,
                                })
                                //console.info("Add QRcode:", x, y)
                                pdf.addImage(qr, x+48, y+13, qrSize, qrSize)
                            }
                        }
                        if(cuttingGuides === "dashed_line"){
                            // Add first dashed lines for colon's
                            {
                                let xFrom = margin - (card_margin / 2)
                                let yFrom = ((cardHeight + card_margin) * rowID) + margin - (card_margin / 2)
                                let xTo   = margin - (card_margin / 2)
                                let yTo   = ((cardHeight + card_margin) * rowID) + (cardHeight + margin) + (card_margin / 2)
                                //console.info("Add DottedLine:", xFrom, yFrom, xTo, yTo)
                                dottedLine(pdf, xFrom, yFrom, xTo, yTo, 2)
                            }
                        }
                        // Finished handling first row
                        isFirstRow = false
                    }
                }

                const edgeMargin = pageConfig[this.pageFormat].margin
                const cardMargin = pageConfig[this.pageFormat].card_margin
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
                    await addCardGrid(pageGrid, this.pageFormat, this.frontImage, edgeMargin, cardMargin, false, this.cuttingGuides)
                    await addCardGrid(pageGrid, this.pageFormat, this.backImage, edgeMargin, cardMargin, true, this.cuttingGuides)
                }

                pdf.save("gift-cards.pdf")
            },
        },
    }

/**
 * Draws a dotted line on a jsPDF doc between two points.
 * Note that the segment length is adjusted a little so
 * that we end the line with a drawn segment and don't
 * overflow.
 * From: https://stackoverflow.com/questions/27760789/create-a-dashed-or-dotted-line-in-jspdf
 */
function dottedLine(doc, xFrom, yFrom, xTo, yTo, segmentLength)
{
    // Calculate line length (c)
    var a = Math.abs(xTo - xFrom);
    var b = Math.abs(yTo - yFrom);
    var c = Math.sqrt(Math.pow(a,2) + Math.pow(b,2));

    // Make sure we have an odd number of line segments (drawn or blank)
    // to fit it nicely
    var fractions = c / segmentLength;
    var adjustedSegmentLength = (Math.floor(fractions) % 2 === 0) ? (c / Math.ceil(fractions)) : (c / Math.floor(fractions));

    // Calculate x, y deltas per segment
    var deltaX = adjustedSegmentLength * (a / c);
    var deltaY = adjustedSegmentLength * (b / c);

    var curX = xFrom, curY = yFrom;
    while (curX <= xTo && curY <= yTo)
    {
        doc.line(curX, curY, curX + deltaX, curY + deltaY);
        curX += 2*deltaX;
        curY += 2*deltaY;
    }
}

</script>
