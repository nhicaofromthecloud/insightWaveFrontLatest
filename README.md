# InsightWave - AI-Powered Customer Review Analytics Dashboard

InsightWave is a modern web application built with Next.js that helps businesses analyze customer reviews using AI. The platform provides real-time insights, sentiment analysis, and actionable recommendations based on customer feedback.

## 🚀 Features

- AI-powered chat interface for review analysis
- Real-time sentiment analysis
- Customer feedback trends and patterns
- Interactive dashboards and visualizations
- Dark/Light theme support
- Authentication system
- Responsive design

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MongoDB
- **AI Integration**: OpenAI
- **Charts**: Recharts
- **Form Handling**: React Hook Form
- **State Management**: React Query
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+
- MongoDB
- OpenAI API key
- Git

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo.git
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
AUTH_SECRET=your_auth_secret_here
API_URL=your_api_url_here
OPENAI_API_KEY=your_openai_api_key_here
MONGODB_URI=your_mongodb_uri_here
```

4. Start the development server:

```bash
pnpm dev
```

## 🏗️ Project Structure

## 🔒 Authentication

The application uses NextAuth.js for authentication. Currently supported methods:

- Email/Password
- GitHub (configurable)

## 💾 Database Schema

The application uses MongoDB with Mongoose for data modeling. Main schemas include:

- Chats
- Messages
- Reviews
- Customers

## 🎨 Styling

The project uses Tailwind CSS with a custom theme configuration. Theme toggling is supported.

## 📦 Building for Production

1. Build the application:

```bash
pnpm build
```

2. Start the production server:

```bash
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
