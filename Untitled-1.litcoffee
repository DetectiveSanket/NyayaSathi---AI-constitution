# File Tree: NyayaSathi - AI constitution

**Generated:** 3/19/2026, 3:30:35 PM
**Root Path:** `d:\NyayaSathi - AI constitution`

```
├── .github
│   ├── appmod
│   │   └── appcat
│   ├── instructions
│   └── workflow
│       └── CICD.yaml
├── Backend
│   ├── DB
│   │   └── db.js
│   ├── controllers
│   │   ├── chat-controller.js
│   │   ├── contact-controller.js
│   │   ├── conversation-controller.js
│   │   ├── docs-controller.js
│   │   ├── rag-controller.js
│   │   ├── summarize-controller.js
│   │   └── user-controller.js
│   ├── github
│   │   └── workflows
│   │       └── Integration.yml
│   ├── middleware
│   │   ├── auth.js
│   │   ├── ragAuth.js
│   │   ├── rateLimiter.js
│   │   └── validateRequest.js
│   ├── models
│   │   ├── contact-module.js
│   │   ├── conversation.js
│   │   ├── conversationMessage.js
│   │   ├── document.js
│   │   ├── documentChunk.js
│   │   ├── legalDocument.js
│   │   ├── message.js
│   │   └── user-module.js
│   ├── routes
│   │   ├── chat-route.js
│   │   ├── contact-route.js
│   │   ├── docs-routes.js
│   │   ├── rag-routes.js
│   │   └── user-route.js
│   ├── services
│   │   ├── agents
│   │   │   ├── agentAdapter.js
│   │   │   ├── agentGraph.js
│   │   │   └── googleModel.js
│   │   ├── documents
│   │   │   └── extractText.js
│   │   ├── llm
│   │   │   └── llmAdapter.js
│   │   ├── conversationMemory.js
│   │   ├── conversationService.js
│   │   ├── embeddingService.js
│   │   ├── memoryService.js
│   │   ├── redisClient.js
│   │   ├── s3Client.js
│   │   └── s3Presign.js
│   ├── uploads
│   ├── utils
│   │   ├── cloudinary.js
│   │   ├── contentModeration.js
│   │   ├── language.js
│   │   ├── mailer.js
│   │   └── sendEmail.js
│   ├── workflows
│   │   └── index.js
│   ├── .gitignore
│   ├── S3_CORS_CONFIG.md
│   ├── app.js
│   ├── eng.traineddata
│   ├── package-lock.json
│   └── package.json
├── Frontend
│   ├── components
│   │   ├── extra
│   │   └── nurui
│   │       ├── styles
│   │       │   └── shiny-card.css
│   │       ├── SpotlightCard.jsx
│   │       ├── background-shine-button.jsx
│   │       ├── contact-form.jsx
│   │       ├── shiny-card-demo.jsx
│   │       ├── shiny-card.jsx
│   │       ├── shiny-input.jsx
│   │       ├── shiny-text-area.jsx
│   │       └── spotlight-card.jsx
│   ├── lib
│   │   └── utils.js
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── Documentation
│   │   │   ├── components
│   │   │   │   ├── docs
│   │   │   │   │   ├── BackToTop.jsx
│   │   │   │   │   ├── Breadcrumbs.jsx
│   │   │   │   │   ├── ContentArea.jsx
│   │   │   │   │   ├── DocumentationPage.jsx
│   │   │   │   │   ├── FeedbackSection.jsx
│   │   │   │   │   ├── Footer.jsx
│   │   │   │   │   ├── Navbar.jsx
│   │   │   │   │   ├── OnThisPage.jsx
│   │   │   │   │   ├── Sidebar.jsx
│   │   │   │   │   └── VersionBadge.jsx
│   │   │   │   └── others
│   │   │   ├── contexts
│   │   │   │   └── ThemeContext.jsx
│   │   │   ├── data
│   │   │   │   └── docsData.js
│   │   │   ├── app.css
│   │   │   ├── app.jsx
│   │   │   └── index.css
│   │   ├── ProtectionRoutes
│   │   │   ├── AutoDismissNotification.jsx
│   │   │   ├── Error.jsx
│   │   │   ├── GuestRoute.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── RAG Model
│   │   │   ├── components
│   │   │   │   ├── ui
│   │   │   │   │   ├── accordion.tsx
│   │   │   │   │   ├── alert-dialog.tsx
│   │   │   │   │   ├── alert.tsx
│   │   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   │   ├── avatar.tsx
│   │   │   │   │   ├── badge.tsx
│   │   │   │   │   ├── breadcrumb.tsx
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── calendar.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── carousel.tsx
│   │   │   │   │   ├── chart.tsx
│   │   │   │   │   ├── checkbox.tsx
│   │   │   │   │   ├── collapsible.tsx
│   │   │   │   │   ├── command.tsx
│   │   │   │   │   ├── context-menu.tsx
│   │   │   │   │   ├── dialog.tsx
│   │   │   │   │   ├── drawer.tsx
│   │   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   │   ├── form.tsx
│   │   │   │   │   ├── hover-card.tsx
│   │   │   │   │   ├── input-otp.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── label.tsx
│   │   │   │   │   ├── menubar.tsx
│   │   │   │   │   ├── navigation-menu.tsx
│   │   │   │   │   ├── pagination.tsx
│   │   │   │   │   ├── popover.tsx
│   │   │   │   │   ├── progress.tsx
│   │   │   │   │   ├── radio-group.tsx
│   │   │   │   │   ├── resizable.tsx
│   │   │   │   │   ├── scroll-area.tsx
│   │   │   │   │   ├── select.tsx
│   │   │   │   │   ├── separator.tsx
│   │   │   │   │   ├── sheet.tsx
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── skeleton.tsx
│   │   │   │   │   ├── slider.tsx
│   │   │   │   │   ├── sonner.tsx
│   │   │   │   │   ├── switch.tsx
│   │   │   │   │   ├── table.tsx
│   │   │   │   │   ├── tabs.tsx
│   │   │   │   │   ├── textarea.tsx
│   │   │   │   │   ├── toast.tsx
│   │   │   │   │   ├── toaster.tsx
│   │   │   │   │   ├── toggle-group.tsx
│   │   │   │   │   ├── toggle.tsx
│   │   │   │   │   ├── tooltip.tsx
│   │   │   │   │   └── use-toast.ts
│   │   │   │   ├── ChatComposer.tsx
│   │   │   │   ├── ChatHeader.tsx
│   │   │   │   ├── ChatSidebar.tsx
│   │   │   │   ├── DocumentLibraryModal.tsx
│   │   │   │   ├── EditProfileModal.tsx
│   │   │   │   ├── FilePreviewModal.tsx
│   │   │   │   ├── FileShareModal.tsx
│   │   │   │   ├── FileUploadZone.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MobileChatLayout.tsx
│   │   │   │   ├── ModelSelectionModal.tsx
│   │   │   │   ├── SettingsModal.tsx
│   │   │   │   └── TTSControls.tsx
│   │   │   ├── contexts
│   │   │   │   ├── FileManagerContext.tsx
│   │   │   │   └── TTSContext.tsx
│   │   │   ├── hooks
│   │   │   │   ├── use-mobile.tsx
│   │   │   │   ├── use-toast.ts
│   │   │   │   └── useResponsive.tsx
│   │   │   ├── lib
│   │   │   │   └── utils.ts
│   │   │   ├── pages
│   │   │   │   ├── Index.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── chatBot.jsx
│   │   │   └── chatbot.css
│   │   ├── Web Intro
│   │   │   ├── components
│   │   │   │   ├── AI3DElements.jsx
│   │   │   │   ├── AINetwork3D.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── AdminsDetails.jsx
│   │   │   │   ├── Contact.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   ├── Impact.jsx
│   │   │   │   ├── Stats.jsx
│   │   │   │   ├── Technology.jsx
│   │   │   │   ├── ThemeProvider.jsx
│   │   │   │   └── ThemeSelector.jsx
│   │   │   └── WebIntro.jsx
│   │   ├── assets
│   │   │   ├── Icon
│   │   │   │   ├── email (1).png
│   │   │   │   ├── google.png
│   │   │   │   ├── otp.png
│   │   │   │   ├── pass.png
│   │   │   │   ├── user.png
│   │   │   │   └── username.png
│   │   │   ├── logo.png
│   │   │   ├── logo1.png
│   │   │   ├── logo2.png
│   │   │   └── logo3.png
│   │   ├── auth
│   │   │   ├── ForgetPassword.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── ResetPasswordOTP.jsx
│   │   ├── components
│   │   │   └── ui
│   │   │       └── border-glide.jsx
│   │   ├── contexts
│   │   ├── features
│   │   │   ├── auth
│   │   │   │   └── authThunks.js
│   │   │   └── like
│   │   ├── hooks
│   │   │   ├── useAutoDismiss.js
│   │   │   ├── useDocumentUpload.js
│   │   │   ├── useRagQuery.js
│   │   │   ├── useRagSession.js
│   │   │   ├── useSummarize.js
│   │   │   └── useTranslate.js
│   │   ├── lib
│   │   │   └── utils.ts
│   │   ├── services
│   │   │   ├── api.js
│   │   │   └── ragService.js
│   │   ├── shared
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── LogIn.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Register.jsx
│   │   ├── store
│   │   │   ├── authSlice.js
│   │   │   ├── ragSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── README.md
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── postcss.config.js
│   ├── tailwind.config.cjs
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.js
├── .gitignore
├── LICENSE
└── README.md
```

---
*Generated by FileTree Pro Extension*