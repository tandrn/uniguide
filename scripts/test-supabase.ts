/**
 * Тест подключения к Supabase
 * Запуск: npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Загружаем .env.local вручную
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').replace(/^["']|["']$/g, '').trim();
    process.env[key.trim()] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-project-url') {
  console.error('❌ Supabase не настроен!');
  console.log('\n📝 Заполни .env.local:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  console.log('\n📖 Инструкция: SUPABASE_SETUP.md\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Проверка подключения к Supabase...\n');
  
  try {
    // Проверка подключения
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Ошибка запроса:', error.message);
      console.log('\n💡 Возможные причины:');
      console.log('   1. Таблицы ещё не созданы (выполни supabase/schema.sql)');
      console.log('   2. Неверный API ключ');
      console.log('   3. Проект не создан');
      process.exit(1);
    }
    
    console.log('✅ Подключение успешно!\n');
    console.log(`📊 Найдено университетов: ${data?.length || 0}\n`);
    
    if (data && data.length > 0) {
      console.log('📚 Университеты:');
      data.forEach((uni: any) => {
        console.log(`   • ${uni.name} (${uni.city})`);
      });
    } else {
      console.log('⚠️  База данных пуста');
      console.log('\n💡 Запусти SQL из supabase/schema.sql для создания данных');
    }
    
    console.log('\n✅ Всё работает!\n');
    
  } catch (err) {
    console.error('❌ Ошибка:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

testConnection();
