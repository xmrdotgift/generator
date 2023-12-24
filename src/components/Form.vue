<template>
    <form ref="form" class="form">
        <div class="mb-3">
            <div class="mb-3">
                <label for="select_template" class="form-label">Template</label>
                <select v-model="template" @change="updatePreviewImages" id="select_template" name="template" class="form-control">
                    <option value="black">Black</option>
                    <option value="bw">Black & White</option>
                    <option value="circles">Circles</option>
                    <option value="gift4you">Gift4You</option>
                    <option value="giftbox">Giftbox</option>
                    <option value="orange">Orange</option>
                </select>
            </div>

            <div class="mb-0 row">
                <div class="col-6">
                    <img ref="templateFrontImage" :src="setFrontPreviewImage" class="border rounded w-100" alt="[template preview front]" title="Front side view">
                </div>
                <div class="col-6">
                    <img ref="templateBackImage" :src="setBackPreviewImage" class="border rounded w-100" alt="[template preview back]" title="Back side view">
                </div>
            </div>
        </div>

        <!--<input type="hidden" name="wallet_type" value="online">-->
        <div class="mb-3">
            <label for="wallet_type" class="form-label">Wallet type</label>
            <select id="wallet_type" name="wallet_type" class="form-control">
                <option value="online">Non-custodial online wallet</option>
                <option value="mnemonic">Mnemonic (24word)</option>
                <option value="monero_wallet">Wallet Uri Scheme (24word)</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="restore_height" class="form-label">Restore height</label>
            <input type="number" id="restore_height" class="form-control" :value="restoreHeight" min="0" name="restore_height">
        </div>

        <div class="mb-3">
            <label for="paper_format" class="form-label">Paper size</label>
            <select id="paper_format" name="paper_format" class="form-control">
                <option value="a4">A4</option>
                <option value="a4_compact">A4 - Compact</option>
                <option value="letter">US Letter</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="cards" class="form-label">Cards</label>
            <select id="cards" class="form-control" name="cards">
                <option>8</option>
                <option>16</option>
                <option>32</option>
                <option>48</option>
                <option>64</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="cutting_guides" class="form-label">Cutting guides around the cards</label>
            <select id="cutting_guides" name="cutting_guides" class="form-control">
                <option value="dashed_line">Dashed Line</option>
                <option value="none">None</option>
            </select>
        </div>

        <div class="row mb-3">
            <div class="col-12">
                <input type="button" class="btn btn-primary" @click="submit" value="Generate PDF">
            </div>
        </div>
    </form>
</template>

<script>
    import monerojs from "monero-javascript"

    export default {
        emits: [
            "submit",
        ],

        methods: {
            submit() {
                this.$emit("submit", this.$refs.form, this.$refs.templateFrontImage, this.$refs.templateBackImage)
            }
        },

        computed: {
            setFrontPreviewImage() {
                return "https://xmr.gift/templates/" + this.template + "/front.png"
            },

            setBackPreviewImage() {
                return "https://xmr.gift/templates/" + this.template + "/back.png"
            }
        },

        data() {
            return {
                template: "black",
                restoreHeight: "0",
            }
        },

        async mounted() {
            const wallet = await monerojs.connectToDaemonRpc({
                uri: "https://node.xmr.gift",
                pollInterval: 10000,
                proxyToWorker: false,
            })
            this.restoreHeight = await wallet.getHeight()
        }
    }
</script>
