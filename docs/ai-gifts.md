How AI Gift Generation Will Work

1. Data Input Sources

- Personal Notes: Users' notes about the birthday person (hobbies, interests, preferences)
- Relationship Type: Friend, family, colleague categorization
- Context: Age, occasion specifics

2. User Flow

- User navigates to the Gifts tab in BirthdayDetailScreen
- Option to "Use notes for ideas" - toggles whether to include personal notes
- Press "Generate Gift Ideas" button to trigger AI generation
- Currently shows a mock alert, but will make API call to /api/gifts/suggest

3. AI Processing (Planned)

The backend CloudFlare Worker endpoint will:

- Send user notes + context to AI service (likely OpenAI/Anthropic API)
- AI analyzes the input to generate 5-8 personalized gift suggestions
- Suggestions are contextual based on interests, relationship, and budget

4. Business Model

- First generation: Free (5-8 suggestions)
- Additional generations: $1 each via in-app purchase
- Annual reset: Free generation resets on each person's birthday
- Usage tracking: Database tracks tokens used and costs

5. Monetization Integration

- Generated suggestions include affiliate links (4-10% commission)
- Direct gift card purchase options displayed alongside suggestions
- Premium subscription planned for unlimited generations

6. Technical Architecture

- API endpoint: /api/gifts/suggest on CloudFlare Workers
- Database: gift_suggestions_log table tracks usage, costs, and results
- Response format: JSON with gift ideas, descriptions, and affiliate links
