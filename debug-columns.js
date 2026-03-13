// Diagnostic script to debug column duplication issue
// Run this in the browser console on the deployed site

console.log('=== COLUMN DUPLICATION DIAGNOSTIC ===');

// 1. Check localStorage for column selections
const storageKey = 'neuprint-column-selections-male-cns:v0.10';
const saved = localStorage.getItem(storageKey);
console.log('1. LocalStorage data:');
console.log(saved ? JSON.parse(saved) : 'No saved data');

// 2. Check Redux store for visible columns
if (typeof store !== 'undefined') {
  const state = store.getState();
  const visibleColumns = state.visibleColumns;
  console.log('\n2. Redux visibleColumns state:');
  console.log(visibleColumns.toJS ? visibleColumns.toJS() : visibleColumns);

  // Check for duplicate column IDs or names
  const tabColumns = visibleColumns.get('tab');
  if (tabColumns) {
    tabColumns.forEach((columns, tabIndex) => {
      if (columns && columns.size > 0) {
        console.log(`\n3. Tab ${tabIndex} columns (${columns.size} total):`);

        const columnNames = {};
        const columnIds = {};

        columns.forEach((col, index) => {
          const colObj = col.toJS ? col.toJS() : col;
          console.log(`  [${index}] id: ${colObj.id}, name: ${colObj.name}, status: ${colObj.status}`);

          // Track duplicates
          if (columnNames[colObj.name]) {
            console.warn(`  ⚠️  DUPLICATE NAME: "${colObj.name}" appears at indices ${columnNames[colObj.name]} and ${index}`);
          } else {
            columnNames[colObj.name] = index;
          }

          if (columnIds[colObj.id]) {
            console.warn(`  ⚠️  DUPLICATE ID: "${colObj.id}" appears at indices ${columnIds[colObj.id]} and ${index}`);
          } else {
            columnIds[colObj.id] = index;
          }
        });
      }
    });
  }
} else {
  console.log('\n2. Redux store not accessible from window.store');
  console.log('You may need to add: window.store = store; in your app initialization');
}

console.log('\n=== END DIAGNOSTIC ===');
