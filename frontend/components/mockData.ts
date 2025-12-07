import { Article } from '../App';

export const mockArticles: Article[] = [
  {
    id: 1,
    title: 'New Healthcare Program Launches Nationwide',
    category: 'Health',
    date: 'December 7, 2025',
    content: 'A new healthcare program has been launched across the country, aiming to provide better access to medical services for senior citizens. The program includes free health checkups, discounted medications, and easier access to specialist appointments. Healthcare providers will work together to ensure that elderly patients receive coordinated care.',
    simpleContent: 'A new healthcare program for older adults started today. It offers free health checkups and cheaper medicine. It will be easier to see doctors and specialists.',
    verySimpleContent: 'Good news! Older adults can now get free health checkups and cheaper medicine. Seeing doctors will be easier.',
    summary: 'The government launched a new healthcare program to help senior citizens get better medical care with free checkups and discounted medicine.',
    meaningForYou: 'You can now get free yearly health checkups at your local clinic. Your medicine costs might go down. It will be easier to see a specialist when you need one.',
    terms: [
      { term: 'Health Checkup', definition: 'A visit to the doctor where they check your blood pressure, weight, and overall health to make sure everything is okay.' },
      { term: 'Specialist', definition: 'A doctor who focuses on one specific area, like heart problems or eye care.' }
    ]
  },
  {
    id: 2,
    title: 'City Council Approves New Community Center',
    category: 'Politics',
    date: 'December 7, 2025',
    content: 'The city council has unanimously approved funding for a new community center in the downtown area. The facility will include a library, meeting rooms, and recreational spaces designed specifically with accessibility in mind. Construction is expected to begin next month and be completed within 18 months.',
    simpleContent: 'The city approved money for a new community center downtown. It will have a library and meeting rooms. The building will be easy for everyone to use, including people who use wheelchairs.',
    verySimpleContent: 'A new community center is coming! It will have books and meeting rooms. Everyone can use it easily.',
    summary: 'The city is building a new community center with a library and meeting rooms that everyone can access easily.',
    meaningForYou: 'You will have a new place nearby to read books, meet friends, and join activities. The building will be easy to get around in.',
    terms: [
      { term: 'Community Center', definition: 'A building where neighbors can meet, do activities, and use services like libraries.' },
      { term: 'Accessibility', definition: 'Making sure buildings and services can be used by everyone, including people with disabilities.' }
    ]
  },
  {
    id: 3,
    title: 'Local Businesses Report Strong Growth This Quarter',
    category: 'Economy',
    date: 'December 7, 2025',
    content: 'Small businesses in the region have reported strong economic growth over the past three months. Retail stores, restaurants, and service providers all saw increased customer traffic and sales. Economists attribute this growth to improved consumer confidence and stable employment rates.',
    simpleContent: 'Local shops and restaurants did well in the last few months. More people are shopping and eating out. This is because people feel good about their money and jobs.',
    verySimpleContent: 'Local stores are doing well. More people are shopping. Jobs are good.',
    summary: 'Local businesses are growing because more people are shopping and going to restaurants, thanks to good jobs and confidence about money.',
    meaningForYou: 'This means the shops and restaurants in your neighborhood are doing well. Prices should stay stable, and services you use should continue to be available.',
    terms: [
      { term: 'Quarter', definition: 'A period of three months. Businesses often measure their progress every three months.' },
      { term: 'Consumer Confidence', definition: 'How good people feel about their money situation and whether they feel comfortable spending.' }
    ]
  },
  {
    id: 4,
    title: 'International Summit Focuses on Climate Action',
    category: 'World',
    date: 'December 6, 2025',
    content: 'World leaders gathered at an international summit to discuss strategies for addressing climate change. The conference focused on reducing carbon emissions, protecting natural resources, and supporting countries most affected by environmental changes. Several nations pledged increased funding for renewable energy projects.',
    simpleContent: 'Leaders from many countries met to talk about protecting the environment. They want to reduce pollution and help countries affected by weather changes. Many promised to spend more money on clean energy.',
    verySimpleContent: 'World leaders met to protect the Earth. They want cleaner air and to help countries with weather problems.',
    summary: 'World leaders met to discuss protecting the environment by reducing pollution and investing in clean energy.',
    meaningForYou: 'This could lead to cleaner air and water in your area. You might see more solar panels and wind turbines, which are better for the environment.',
    terms: [
      { term: 'Climate Change', definition: 'Changes in the Earth\'s weather patterns, including warmer temperatures and more extreme weather.' },
      { term: 'Renewable Energy', definition: 'Energy from sources that don\'t run out, like sunlight and wind, instead of coal or oil.' }
    ]
  },
  {
    id: 5,
    title: 'Severe Weather Alert: Winter Storm Expected',
    category: 'Breaking News',
    date: 'December 7, 2025',
    content: 'Weather services have issued alerts for a significant winter storm expected to arrive this weekend. Heavy snowfall and strong winds are forecasted. Residents are advised to stock up on essential supplies, check heating systems, and avoid unnecessary travel during the storm.',
    simpleContent: 'A big snowstorm is coming this weekend. There will be lots of snow and wind. Make sure you have food at home, your heater works, and stay inside if possible.',
    verySimpleContent: 'Big snowstorm coming this weekend. Stay home and stay warm. Have food ready.',
    summary: 'A large winter storm with heavy snow is coming this weekend. Stay inside, have supplies ready, and make sure your home is warm.',
    meaningForYou: 'You should buy groceries now so you don\'t have to go out in the storm. Check that your heater is working. Stay home this weekend to stay safe.',
    terms: [
      { term: 'Weather Alert', definition: 'An official warning about dangerous weather coming soon.' },
      { term: 'Essential Supplies', definition: 'Important things you need at home like food, water, medicine, and batteries.' }
    ]
  },
  {
    id: 6,
    title: 'New Theater Production Opens to Rave Reviews',
    category: 'Entertainment',
    date: 'December 6, 2025',
    content: 'A new musical production has opened at the Grand Theater, receiving enthusiastic praise from audiences and critics alike. The show features classic songs, talented performers, and stunning visual effects. Special matinee performances have been scheduled for senior audiences with enhanced audio assistance.',
    simpleContent: 'A new musical show opened at the Grand Theater. People love it! It has great music and talented singers. They have special afternoon shows for older audiences with better sound.',
    verySimpleContent: 'Great new music show at the theater! Special afternoon shows for you with better sound.',
    summary: 'A wonderful new musical opened at the Grand Theater with special afternoon shows for older audiences featuring better sound quality.',
    meaningForYou: 'You can enjoy this new show at special afternoon times. The theater has made sure the sound is clear so you can hear all the music and dialogue easily.',
    terms: [
      { term: 'Matinee', definition: 'A show that happens in the afternoon instead of evening.' },
      { term: 'Audio Assistance', definition: 'Special technology that makes sound clearer and easier to hear.' }
    ]
  }
];
