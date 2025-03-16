# App Flow Document for the Modern Flashcard Website

## Onboarding and Sign-In/Sign-Up

When a new user first arrives on the website, they are greeted by a clean and inviting landing page that is designed to simplify the study process. As there is no requirement for creating an account or signing in, users can immediately engage with the application without the need to remember passwords or go through a lengthy sign-up process. The landing page clearly displays a language selection option allowing students to choose between English and French. The user is invited to proceed directly to the upload interface which is prominently featured on the home page.

## Main Dashboard or Home Page

Once on the home page, the user sees a modern, uncluttered interface centered around a file upload area. The design places a drag-and-drop region alongside a clickable file selector. This page is not only visually appealing with modern styling but also functional, providing intuitive cues for uploading course transcripts. The page layout is simple, with a header that includes the language toggle and minimal navigation elements so that the focus remains on the upload task. From here the student is gently guided through the first step of their learning journey without distractions from unnecessary features.

## Detailed Feature Flows and Page Transitions

After the student uploads one or more plain text transcripts (each file limited to a maximum of 50 words in total), the application automatically transitions to the processing stage. In this stage, the AI component, OpenAI GPT-4o-Mini, takes over and reads through the full content of the transcript to generate a course subject and outline. As this analysis is performed, the interface provides real-time visual feedback including loading indicators and progress bars. This ensures that the student is informed about the process and is aware that the system is actively working on their input.

Once the AI processing is complete, the application transitions to a dedicated display page where the student sees the automatically generated course subject and outline in a clear, well-formatted manner. There is no extra input required from the student at this point. The page features a prominent call-to-action button labeled "Ready!" which the student clicks when they wish to move on to the flashcard generation session.

Following the confirmation, the interface shifts to a minimalistic flashcard display where the student is presented with one flashcard at a time. Navigation is straightforward with two clearly marked controls: pressing "next" triggers the generation of a new flashcard, while selecting "stop" concludes the session. If the student clicks "stop", the system then generates and displays a summary of the session’s flashcards. The flashcard interface is intentionally minimal to maintain focus on the study material, providing a seamless interaction that takes the student step-by-step through the learning process.

After reading the summary, the system automatically resets, returning the user to the home/upload page. This cyclical navigation design ensures that the student can immediately begin a new session if desired, streamlining continuous learning and revision.

## Settings and Account Management

Since the flashcard website does not require user accounts or permanent data storage, the available settings are very straightforward and user friendly. The only configuration available to the end user is the language toggle, which is easily accessible from the header of the website. This allows students to switch between English and French at any point during their session. Administrative settings, such as configuring the OpenAI API key, selecting the model, and specifying the default URL, are maintained in a secure configuration file that is not visible to the student, ensuring that all back-end settings are managed separately from the front-end user experience. Once any changes in settings are made or language is switched, the student is seamlessly returned to their current step in the application without any disruption.

## Error States and Alternate Paths

In cases where a user might upload a file that is not in plain text or exceeds the maximum of 50 words, the application promptly displays an error message that explains the issue in simple language. During the uploading process or while awaiting AI analysis, if the system encounters delays or network issues, clear visual cues such as error dialogs or alternative loading graphics are presented to keep the user informed. If a user attempts to navigate to a section that is not accessible, the application gracefully redirects them to the correct page with an explanation as to why the action was not possible. These error messages are designed to be helpful and will include steps or reminders on how to correct the input, ensuring that the normal flow of the application is quickly restored for an optimal user experience.

## Conclusion and Overall App Journey

The overall journey through the flashcard website is designed to be straightforward and efficient. A student arrives at a beautifully designed landing page and is immediately able to upload course transcripts without any delay or need for account creation. Following the upload, the application seamlessly performs AI-driven analysis and presents a clear overview of the course subject and outline generated from the transcript. With minimal action required from the student, they confirm the processed data and transition to a flashcard interface where interactions are simple, using clearly labeled buttons to move through flashcards or end the session. When the user stops, they receive a session summary, ensuring that all generated study material is consolidated before being automatically reset to the beginning of the cycle. The entire flow relies on modern design principles, visual feedback at every step, and easy navigation. This clear and connected sequence of actions ensures that university students can focus on their studies without distractions, making the website a powerful tool in aiding their learning process.
