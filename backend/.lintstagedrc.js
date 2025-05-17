module.exports = {
    '*.ts': (files) => {
        console.log('\n📝 Файлы для проверки:');
        files.forEach(file => console.log(`   - ${file}`));
        console.log('\n🔧 Запуск проверок...\n');
        return [
            'eslint --fix',
            'prettier --write'
        ];
    }
}; 