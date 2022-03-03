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
                    <img :src="setFrontPreviewImage" class="border rounded w-100" alt="[template preview front]" title="Front side view">
                </div>
                <div class="col-6">
                    <img :src="setBackPreviewImage" class="border rounded w-100" alt="[template preview back]" title="Back side view">
                </div>
            </div>
        </div>

        <div class="mb-3">
            <label for="wallet_type" class="form-label">Wallet type</label>
            <select id="wallet_type" name="wallet_type" class="form-control">
                <option value="online">Non-custodial online wallet</option>
                <option value="mnemonic">Mnemonic</option>
            </select>
        </div>

        <div class="mb-3">
            <label for="cards" class="form-label">Cards</label>
            <select id="cards" class="form-control" name="cards">
                <option>8</option>
                <option>16</option>
                <option selected>32</option>
                <option>48</option>
                <option>64</option>
            </select>
        </div>

        <div class="row mb-3">
            <div class="col-12">
                <input type="button" class="btn btn-primary" @click="$emit('submit', $refs.form); submittedOnce = true" value="Generate">
                &nbsp;
                <input type="button" v-if="submittedOnce" class="btn btn-success" @click="$emit('print')" value="Print">
            </div>
        </div>
    </form>
</template>

<script>
    export default {
        emits: [
            "submit",
            "print",
        ],

        computed: {
            setFrontPreviewImage() {
                return "https://xmr.gift/templates/"+this.template+"/front.png"
            },

            setBackPreviewImage() {
                return "https://xmr.gift/templates/"+this.template+"/back.png"
            }
        },

        data() {
            return {
                submittedOnce: false,
                template: "black",
            }
        }
    }
</script>
