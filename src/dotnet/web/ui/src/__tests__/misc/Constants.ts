/* istanbul ignore file */
import { AccountInfo, AuthenticationResult, AuthError } from '@azure/msal-browser';

export const TEST_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJ0ZXN0LWF1ZC0uY29tIiwiQWNjb3VudElkIjoidGVzdC1hY2NvdW50LWlkIiwiSXNzdWVyTG9jYXRpb24iOiJ3ZXN0ZXVyb3BlIiwiSXNzdWVyIjoidGVzdC1pc3N1ZXIuY29tIiwiVXNlcm5hbWUiOiJqb2huLmRvZUBjb250b3NvLmNvbSIsIlBlcm1pc3Npb24iOiJSZWFkZXIiLCJFeHRlcm5hbFVzZXJJZCI6InRlc3QtZXh0cmVuYWwtaWQiLCJleHAiOjE2NTU4MTQ1NjcsIlVzZXJUeXBlIjoiTWljcm9zb2Z0Q29ycEFhZCIsImlhdCI6MTY1NTgxNDU2NywiTmFtZSI6IkpvaG4gRG9lIn0.K3L_t-aQw-xlPsJe7dX1B4-AgEhdJfZGjdkXs1MArQQ';

//
// Token parsed is equal to :
//
// {
//   "alg": "HS256"
// }.{
//   "aud": "test-aud-.com",
//   "AccountId": "test-account-id",
//   "IssuerLocation": "westeurope",
//   "Issuer": "test-issuer.com",
//   "Username": "john.doe@contoso.com",
//   "Permission": "Reader",
//   "ExternalUserId": "test-extrenal-id",
//   "exp": 1655814567,
//   "UserType": "MicrosoftCorpAad",
//   "iat": 1655814567,
//   "Name": "John Doe"
// }.[Signature]

export const TEST_DATA_CLIENT_INFO = {
  TEST_UID: '123-test-uid',
  TEST_UID_ENCODED: 'MTIzLXRlc3QtdWlk',
  TEST_UTID: '456-test-utid',
  TEST_UTID_ENCODED: 'NDU2LXRlc3QtdXRpZA==',
  TEST_UTID_URLENCODED: 'NDU2LXRlc3QtdXRpZA',
  TEST_DECODED_CLIENT_INFO: '{"uid":"123-test-uid","utid":"456-test-utid"}',
  TEST_INVALID_JSON_CLIENT_INFO: '{"uid":"123-test-uid""utid":"456-test-utid"}',
  TEST_RAW_CLIENT_INFO: 'eyJ1aWQiOiIxMjMtdGVzdC11aWQiLCJ1dGlkIjoiNDU2LXRlc3QtdXRpZCJ9',
  TEST_CLIENT_INFO_B64ENCODED: 'eyJ1aWQiOiIxMjM0NSIsInV0aWQiOiI2Nzg5MCJ9',
  TEST_HOME_ACCOUNT_ID: 'MTIzLXRlc3QtdWlk.NDU2LXRlc3QtdXRpZA==',
};

export const testAccount: AccountInfo = {
  homeAccountId: TEST_DATA_CLIENT_INFO.TEST_HOME_ACCOUNT_ID,
  localAccountId: TEST_DATA_CLIENT_INFO.TEST_UID_ENCODED,
  environment: 'login.windows.net',
  tenantId: TEST_DATA_CLIENT_INFO.TEST_UTID,
  username: 'example@microsoft.com',
  name: 'John Doe',
};

export const testResult: AuthenticationResult = {
  authority: 'https://login.microsoftonline.com',
  uniqueId: 'unique-id',
  tenantId: 'tenant-id',
  scopes: ['openid', 'profile'],
  idToken: 'test-id-token',
  idTokenClaims: {},
  accessToken: TEST_ACCESS_TOKEN,
  fromCache: false,
  correlationId: 'test-correlation-id',
  expiresOn: new Date(Date.now() + 3600000),
  account: testAccount,
  tokenType: 'Bearer',
};

export const testAuthError: AuthError = {
  errorCode: 'test-error-code',
  errorMessage: 'test-error-message',
  subError: '',
  correlationId: '',
  setCorrelationId: function (correlationId: string): void {
    this.correlationId = correlationId;
  },
  name: 'test-error',
  message: 'test-message',
};

export const testVideo = {
  partition: null,
  description: 'MP4/TEST-DESCRIPTION.MP4',
  privacyMode: 'Private',
  state: 'Processed',
  accountId: 'account-id',
  id: 'video-id',
  thumbnailId: 'thumbnail-id',
  name: 'video-name.mp4',
  userName: ' ',
  created: '2022-06-13T07:35:20.8922059+00:00',
  isOwned: false,
  isEditable: false,
  isBase: true,
  durationInSeconds: 423,
  summarizedInsights: null,
  videos: [
    {
      accountId: 'account-id',
      id: 'video-id',
      state: 'Processed',
      moderationState: 'OK',
      reviewState: 'None',
      privacyMode: 'Private',
      processingProgress: '100%',
      failureCode: 'None',
      failureMessage: '',
      externalId: 'external-hash-id.mp4',
      externalUrl: null,
      metadata: null,
      insights: {
        version: '1.0.0.0',
        duration: '0:07:03.88',
        sourceLanguage: 'en-US',
        sourceLanguages: ['en-US'],
        language: 'en-US',
        languages: ['en-US'],
        transcript: [],
        textualContentModeration: {
          id: 0,
          bannedWordsCount: 0,
          bannedWordsRatio: 0,
          instances: [],
        },
        statistics: {},
      },
      thumbnailId: 'thumbnail-id',
      detectSourceLanguage: false,
      languageAutoDetectMode: 'None',
      sourceLanguage: 'en-US',
      sourceLanguages: ['en-US'],
      language: 'en-US',
      languages: ['en-US'],
      indexingPreset: 'Advanced',
      linguisticModelId: '00000000-0000-0000-0000-000000000000',
      personModelId: '00000000-0000-0000-0000-000000000000',
      isAdult: false,
      publishedUrl: 'https://published-url',
      publishedProxyUrl: null,
      viewToken: 'Bearer=eyJh',
    },
  ],
  videosRanges: [
    {
      videoId: 'A0000',
      range: {
        start: '0:00:00',
        end: '0:07:03.88',
      },
    },
  ],
};

export const testSearchResult = {
  count: 5,
  results: [
    {
      score: 2.3656528,
      document: {
        videoId: 'video-id',
        duration_in_seconds: 354,
        metadata_video_description: 'video-description',
        metadata_first_creation_date: '2022-06-07T15:21:58Z',
        metadata_video_languages: 'NATURAL WITH SPANISH SPEECH',
        metadata_currect_version_creation_date: '2022-06-07T15:22:02Z',
        metadata_keywords: ['Europe'],
        metadata_matching_video_name: '2022-06-07T152158Z_1_LWD307306062022RP1_RTRWNEV_C_3073-SPAIN-POLITICS.MP4',
      },
    },
    {
      score: 2.0567148,
      document: {
        videoId: '9bcfa0ea11',
        duration_in_seconds: 278,
        metadata_video_description: 'video-description',
        metadata_first_creation_date: '2022-06-08T14:39:05Z',
        metadata_video_languages: 'NATURAL WITH GERMAN SPEECH',
        metadata_currect_version_creation_date: '2022-06-08T14:39:08Z',
        metadata_keywords: ['Europe'],
        metadata_matching_video_name: '2022-06-08T143905Z_1_LWD349308062022RP1_RTRWNEV_C_3493-SOCCER-UEFANATIONS-SWI-ESP-PREVIEW.MP4',
      },
    },
    {
      score: 1.8524332,
      document: {
        videoId: '4073abfaa5',
        duration_in_seconds: 235,
        metadata_video_description: 'video-description',
        metadata_first_creation_date: '2022-05-15T09:44:22Z',
        metadata_video_languages: 'NATURAL WITH ENGLISH SPEECH',
        metadata_currect_version_creation_date: '2022-05-15T11:51:40Z',
        metadata_keywords: ['Europe'],
        metadata_matching_video_name: '2022-05-15T094422Z_1_LWD809115052022RP1_RTRWNEV_C_8091-UKRAINE-CRISIS-NATO-DOORSTEPS-UPDATE.MP4',
      },
    },
    {
      score: 1.1357927,
      document: {
        videoId: '9179c12982',
        duration_in_seconds: 418,
        metadata_video_description: 'video-description',
        metadata_first_creation_date: '2022-06-10T14:09:40Z',
        metadata_video_languages: 'NATURAL WITH ENGLISH SPEECH / PART MUTE',
        metadata_currect_version_creation_date: '2022-06-10T14:40:29Z',
        metadata_keywords: ['Arts', 'Culture', 'Entertainment'],
        metadata_matching_video_name: '2022-06-10T140940Z_1_LWD406510062022RP1_RTRWNEV_C_4065-TELEVISION-BECOMING-ELIZABETH.MP4',
      },
    },
    {
      score: 1.0334537,
      document: {
        videoId: 'd4c69e753d',
        duration_in_seconds: 321,
        metadata_video_description:
          '["VIDEO SHOWS: HIGHLIGHTS FROM ROUND ONE OF THE MONTE CARLO MASTERS WITH ALEXANDER BUBLIK BEATING STAN WAWRINKA, FABIO FOGNINI BEATING ARTHUR RINDERKNECH, AND BRAZILIAN SOCCER STAR NEYMAR VISITING WITH NOVAK DJOKOVIC AND ALEXANDER ZVEREV","SHOWS: ROQUEBRUNE-CAP-MARTIN, FRANCE (APRIL 11, 2022) (ATP MEDIA/IMG - See retrictions)","STAN WAWRINKA (SWITZERLAND / YELLOW SHIRT) V ALEXANDER BUBLIK (KAZAKHSTAN)","1. COIN TOSS","FIRST SET","2. SET POINT – WAWRINKA ON SERVE, WAWRINKA WINS THE FIRST SET 6-3 WHEN BUBLIK SENDS A FOREHAND WIDE","SECOND SET","3. BUBLIK ON SERVE – BUBLIK WITH A BACKHAND WINNER","4. SET POINT – WAWRINKA ON SERVE, BUBLIK WINS SET 7-5 WHEN A WAWRINKA FOREHAND TAKES A BAD BOUNCE OFF THE NET AND GOES LONG","THIRD SET","5. BUBLIK WITH AN UNTOUCHABLE DROP SHOT","6. MATCH POINT – WAWRINKA ON SERVE, BUBLIK WINS THE MATCH 3-6 7-5 6-2 WHEN WAWRINKA SENDS A FOREHAND WIDE","7. VARIOUS OF WAWRINKA AND BUBLIK GOING AND SHAKING HANDS AT THE NET","FABIO FOGNINI (ITALY / YELLOW SHIRT) V ARTHUR RINDERKNECH (FRANCE)","8. COIN TOSS","FIRST SET","9. FOGNINI ON SERVE, FOGNINI TAKES POINT WITH A CROSSCOURT FOREHAND WINNER","10. SET PINT – RINDERKNECH ON SERVE, FOGNINI RETURNS WITH ANOTHER CROSSCOURT FOREHAND WINNER TO WIN THE FIRST SET 7-5","11. APPLAUSE","THIRD SET","12. BREAKPOINT – RINDERKNECH ON SERVE, FOGNINI GETS THE BREAK WHEN RINDERKNECH GOES WIDE","13. RINDERKNECH HITTING A BALL TO THE GROUND IN FRUSTRATION","14. MATCH POINT – FOGNINI ON SERVE, FOGNINI WINS THE RALLY WHEN RINDERKNECH GOES LONG – FOGNINI WINS 7-5 4-6 6-3","15. VARIOUS OF RINDERKNECH AND FOGNINI GOING AND SHAKING HANDS AT THE NET","ROQUEBRUNE-CAP-MARTIN, FRANCE (APRIL 11, 2022) (ATP MEDIA/IMG - No resales. No archive)","NEYMAR VISIT","16. VARIOUS OF BRAZILIAN SOCCER STAR WHO CURRENTLY PLAYS FOR PARIS ST GERMAIN ARRIVING AT THE MONTE CARLO MASTERS (3 SHOTS)","17. SERBIAN TENNIS PLAYER, NOVAK DJOKOVIC ARRIVING TO MEET NEYMAR AND ITALY AND PSG SOCCER PLAYER, MARCO VERRATTI","18. PHOTOGRAPHERS TAKING PICTURES OF NEYMAR, VERRATTI, AND DJOKOVIC","19. NEYMAR, VERRATTI, AND DJOKOVIC PLAYING ‘KEEPIE UPPIE’ WITH A GIANT TENNIS BALL AND THEN POSING WITH THE BALL","20. NEYMAR MEETING GERMAN TENNIS PLAYER, ALEXANDER ZVEREV AND BRAZILIAN TENNIS PLAYER, MARCELO MELO","21. NEYMAR SHAKING HANDS WITH ZVEREV AND WISHING BOTH TENNIS PLAYERS GOOD LUCK","STORY: Stan Wawrinka marked his return to Tour level competition for the first time in 13 months by showing glimpses of his old form but the Swiss failed to get past Alexander Bublik in the first round of the Monte Carlo Masters, losing 3-6 7-5 6-2 on Monday (April 11).","The three-times Grand Slam champion suffered a foot injury early in 2021 and had surgery in March last year before another operation three months later, only returning to action at a Challenger Tour tournament in Marbella last month.","While the 37-year-old was beaten in the first round of that event, there were few signs of rustiness against world number 36 Bublik on Court Rainier III as he raced through the first set in only 27 minutes to seize the early advantage in the contest.","Wawrinka, the 2014 champion, squandered an opportunity to break Bublik early in the second set and staved off three set points to hold for 5-5 but could not prevent his determined Kazakh opponent from taking the contest into a decider.","Bublik found his groove to race ahead 5-1 in the third set as Wawrinka appeared to fade before the 24-year-old closed out the victory in style.","Earlier, Italy\'s 2019 champion Fabio Fognini beat Frenchman Arthur Rinderknech 7-5 4-6 6-3 while American Sebastian Korda powered past Botic van de Zandschulp 7-5 6-4 and Spain\'s Albert Ramos-Vinolas downed Tallon Griekspoor 6-4 4-6 6-2.","Former semi-finalist Jo-Wilfried Tsonga will take on Croatia\'s Marin Cilic later on Monday, hoping for a deep run in his final appearance at the Masters 1000 claycourt event, with the Frenchman set to retire after Roland Garros.","The tournament is without a number of big names, including Rafa Nadal, Daniil Medvedev, Dominic Thiem and Matteo Berrettini although world number one Novak Djokovic returns to action and meets Alejandro Davidovich Fokina on Tuesday (April 12).","Djokovic was paid a visit by Brazil and Paris St Germain star Neymar who stopped by the tennis tournament along with PSG team mate Marco Verratti.","The soccer stars also met Germany’s Alexander Zverev and Brazil’s Marcelo Melo.","(Production: Kurt Michael Hall)"]',
        metadata_first_creation_date: '2022-04-11T15:53:37Z',
        metadata_video_languages: 'NATURAL',
        metadata_currect_version_creation_date: '2022-04-11T15:53:41Z',
        metadata_keywords: ['Europe'],
        metadata_matching_video_name: '2022-04-11T155337Z_1_LWD092511042022RP1_RTRWNEV_C_0925-TENNIS-MONTECARLO.MP4',
      },
    },
  ],
  facets: [
    {
      score: 1,
      document: {
        field1: 'field1',
        field2: 'field2',
      },
    },
  ],
};

export const testSearchEmptyResult = {
  count: 0,
  results: [],
  facets: {},
};

export const testSearchOneVideoResult = {
  videoId: 'video-id',
  thumbnailId: 'thumbnail-id',
  videoName: 'video-name.mp4',
  created: null,
  duration_in_seconds: 354,
  metadata_video_description: 'video-description',
  metadata_first_creation_date: '2022-06-07T15:21:58Z',
  metadata_video_languages: 'NATURAL WITH SPANISH SPEECH',
  metadata_currect_version_creation_date: '2022-06-07T15:22:02Z',
  metadata_keywords: ['Europe', 'Spain'],
  metadata_matching_video_name: '2022-06-07T152158Z_1_LWD307306062022RP1_RTRWNEV_C_3073-SPAIN-POLITICS.MP4',
};

export const testStreamingUrlVideo = {
  url: 'https://url-to-video_index/manifest(encryption=cbc,format=m3u8-aapl)',
  jwt: TEST_ACCESS_TOKEN,
};
