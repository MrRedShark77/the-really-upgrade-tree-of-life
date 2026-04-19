<script setup lang="ts">
import { RepeatableUpgradeGroups, RepeatableUpgrades, RepeatableUpgradeStyle } from '@/data/repeatable_upgrades';
import RepeatableUpgradeItem from './RepeatableUpgradeItem.vue';

</script>

<template>
  <p>These are repeatable upgrades! But they have level cap, so it can be increased by late upgrades. The new repeatable upgrade is unlocked by reaching 100 levels of the previous upgrade.</p>
  <div class="table-center" style="gap: 10px;">
    <template v-for="(x, k) in RepeatableUpgradeGroups" :key="'s-'+k">
      <div class="template-frame" v-if="RepeatableUpgrades[x[0]].condition()">
        <h3>{{ RepeatableUpgradeStyle[k].name }}</h3>
        <div class="repeatable-upgrades">
          <RepeatableUpgradeItem v-for="y in x" :key="'ru-'+y" :n="y" :class="{['upgrade-'+RepeatableUpgradeStyle[k].color]: true}"/>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.template-frame {
  width: 500px;
  height: 400px;
  background-color: #c7b39d;
  border: outset 4px #b8a38c;
  padding: 5px 10px;
}
</style>
