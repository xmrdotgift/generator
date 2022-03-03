<template>
    <canvas ref="card" :class="setClasses" width="323" height="204"></canvas>
</template>

<style scoped>
    canvas {
        margin:0;
        padding:0;
        border:2px dotted lightslategray;
    }

    .rounded {
        border-radius: 14px;
    }
</style>

<script>
    import qrcode from "qrcode"

    const qrWidth = 126
    const qrPosX = 181
    const qrPosY = 49

    export default {
        name: "Card",

        props: {
            template: String,
            text: String,
            side: String,
            rounded: String,
        },

        computed: {
            setClasses() {
                return {
                    rounded: this.$props.rounded !== undefined,
                }
            }
        },

        async mounted() {
            const ctx = this.$refs.card.getContext("2d")

            let bgImage = new Image()
            bgImage.onload = async () => {
                ctx.drawImage(bgImage, 0, 0)

                if (this.side !== "back") {
                    return
                }

                let qrImage = new Image()
                qrImage.onload = () => {
                    ctx.drawImage(qrImage, qrPosX, qrPosY)
                }
                qrImage.src = await qrcode.toDataURL(this.text, {
                    errorCorrectionLevel: 'L',
                    width: qrWidth,
                    margin: 2,
                })
            }
            bgImage.src = "https://xmr.gift/templates/"+this.template+"/"+this.side+".svg"
        }
    }
</script>