# random-bot

Telegram-бот со случайными числами и интерактивными кнопками. Развёрнут в Kubernetes с автоматической сборкой через Jenkins и мониторингом в Prometheus + Grafana.

## 📌 О проекте

Бот генерирует случайные числа по командам пользователя: кубик (1–6), число (1–100), монетка (орёл/решка). Работает в Kubernetes, автоматически собирается через Jenkins при пуше в `main`.

## ✨ Возможности

- 🎲 **Кубик** — случайное число 1–6 по команде `/roll`
- 🎯 **Случайное число** — 1–100 по команде `/random`
- 🪙 **Монетка** — орёл или решка по команде `/coin`
- ⌨️ **Интерактивные кнопки** — быстрое меню для команд
- 🚀 **CI/CD через Jenkins** — автодеплой при каждом push
- 📦 **Kubernetes** — развёртывание в K8s
- 📊 **Мониторинг** — метрики в Prometheus, дашборды в Grafana
- 🔔 **Алертинг** — уведомления при падении пода в Telegram

## 🛠️ Технологический стек

### Сам бот (этот репозиторий)

| Компонент | Технология |
| :--- | :--- |
| Язык | Node.js 18 |
| Framework | Telegraf 4.x |
| Конфигурация | dotenv |
| Контейнеризация | Docker |
| Реестр образов | Docker Hub (`docin82/random-bot`) |
| Оркестрация | Kubernetes (Docker Desktop) |
| CI/CD | Jenkins (Kubernetes-агент) |

### Инфраструктура (связанные репозитории)

| Компонент | Технология | Где |
| :--- | :--- | :--- |
| Мониторинг | Prometheus + Grafana | [ansible-monitoring](https://github.com/goncharukinna/ansible-monitoring) |
| Алертинг | Alertmanager → Telegram | [ansible-monitoring](https://github.com/goncharukinna/ansible-monitoring) |
| IaC (для мониторинга) | Ansible | [ansible-monitoring](https://github.com/goncharukinna/ansible-monitoring) |

⚠️ **Важно:** Ansible **не управляет** этим ботом. Деплой random-bot выполняет **Jenkins**.

