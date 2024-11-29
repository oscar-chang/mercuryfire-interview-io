<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div class="q-mb-xl form-section">
        <q-input v-model="tempData.name" label="姓名" outlined dense />
        <q-input v-model="tempData.age" label="年齡" outlined dense type="number" />
        <q-btn color="primary" class="q-mt-md" @click="addRow">新增</q-btn>
      </div>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="name"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ props.row[col.name] }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                @click="handleClickOption(btn, props.row)"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import axios from 'axios';
import { QTableProps } from 'quasar';
import { ref } from 'vue';

interface btnType {
  label: string;
  icon: string;
  status: string;
}

const blockData = ref([
  { name: 'Oscar', age: 39 },
  { name: '志偉', age: 30 },
]);

const tableConfig = ref([
  { label: '姓名', name: 'name', field: 'name', align: 'left' },
  { label: '年齡', name: 'age', field: 'age', align: 'left' },
]);

const tableButtons = ref<btnType[]>([
  { label: '編輯', icon: 'edit', status: 'edit' },
  { label: '刪除', icon: 'delete', status: 'delete' },
]);

const tempData = ref({
  name: '',
  age: '',
});

function addRow() {
  if (!tempData.value.name || !tempData.value.age) {
    alert('請填寫完整資料');
    return;
  }
  blockData.value.push({ ...tempData.value });
  tempData.value = { name: '', age: '' };
}

function handleClickOption(btn: btnType, data: any) {
  if (btn.status === 'edit') {
    tempData.value = { ...data };
    console.log('Editing:', tempData.value);
  } else if (btn.status === 'delete') {
    deleteData(data.name);
  }
}

async function deleteData(name: string) {
  try {
    const response = await axios.post('/api/delete', { name });
    console.log('Delete response:', response.data);
    blockData.value = blockData.value.filter((item) => item.name !== name);
  } catch (error) {
    console.error('Error deleting data:', error);
  }
}
</script>

<style lang="scss" scoped>
/* 表單區域樣式 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.q-input {
  width: 100%;
}

.q-btn {
  align-self: flex-start;
}

/* 表格樣式 */
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}

.q-btn {
  margin: 0 5px;
}
</style>
