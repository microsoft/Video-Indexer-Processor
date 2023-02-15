# Testing

## Unit Tests

Unit tests are defined as tests which calls methods from an individual class directly while mocking any dependencies from outside the class. They verify the functionality of the class methods but don't test how the system functions as a whole, for example from where the tested class is usually called. With unit tests you can quickly identify the location of any logic problems.

The .NET unit tests in this project use the [Xunit Framework](https://xunit.net/) for the tests and the [Moq Framework](https://github.com/Moq/moq) for mocking.

### Functions

Only the func extract app uses .NET and has .NET unit tests. They are located in the folder `src/dotnet/functions/func_extract.Tests`. The func trigger and func dataproc apps are located in the `src/python` folder and have their unit tests there.

The unit tests have their own C# project, separate from the rest of the code which you can see in the project file `src/dotnet/functions/func_extract.Tests/func_extract.Tests.csproj`. This is best practice because then testing dependencies don't have to be present in the production code.

The file/folder structure is mimicked from the production code. For each class that is tested one file is created containing several unit test methods. 

The structure of these methods is always "Arrange, Act, Assert". Any dependencies that are usually injected into the class are instead mocked. A class method is then called using the mock objects as parameters:

```cs
// Mock TraceWriter
var loggerMock = new Mock<ILogger>();

// Mock DurableOrchestrationContext
var mockContext = new Mock<IDurableOrchestrationContext>();

// ... setup mocks ...

// Call the Orchestrator with mock objects
await InsightsExtraction.RunOrchestrator(mockContext.Object, loggerMock.Object);

```

The mock objects are setup to return test values on certain function calls so that the method can process this output properly,for example:

```cs
// Define constants / objects
var jsonObject = new JObject() { { "Date", "2022" }, { "VideoName", "Some Video" } };

// Setup the mock to return the json object when input is requested
mockContext.Setup(x => x.GetInput<JObject>()).Returns(jsonObject);
```

When asserting, we are trying to assert on the logic that is inside the method we are testing. We don't want to verify that a mock returned the correct value, then we would just be testing the mock. Instead of verifying a return value we can also verify that a certain method was called on a mock object (no matter what the return value was).

```cs
// Verify that context.CallActivityAsync was called with these parameters
mockContext.Verify(x => x.CallActivityAsync<bool>(CheckVideoIsAvailableActivity, jsonObject));
```

This is useful when testing Azure durable functions, for example for the func extract orchestrator we want to verify that it calls the other activity functions with the correct parameters (without actually calling them since they are outside of the class and therefore mocked). In the activity functions we want to verify that they correctly call any outside systems such as VI or the blob storage. 

If possible, we want to have positive and negative tests depending of the expected behavior of the class. For example if we expect an exception upon faulty input, it should be tested that this exception is indeed thrown and has the correct message.

```cs
// The mock is setup to time out the function call inside the orchestrator, we then assert that the orchestrator behaves correctly upon timeout
var caughtException = await Assert.ThrowsAsync<Exception>(() => InsightsExtraction.RunOrchestrator(mockContext.Object, loggerMock.Object));

Assert.Equal(CheckVideoIsAvailableActivity + " timed out", caughtException.Message);
```

### Web/Api

The web/api unit tests are located in the folder `src/dotnet/web/api-tests`.

The web/api controllers have some methods which are basically just wrappers for a call to Video Indexer or the Token Service. Since these objects are mocked and the methods have no further logic, they are excluded from code coverage reports using the annotation `[ExcludeFromCodeCoverage]`. For example:

```cs
HttpGet("{videoId}/index")]
[ExcludeFromCodeCoverage]
public async Task<JObject> GetVideoIndexAsync(string videoId)
{
    var token = await this.TokenServices.GetAccessTokenAsync();
    var video = await this.VideoIndexerClient.GetVideoIndexAsync(token, videoId);
    return JObject.Parse(video);
}
```

Methods with logic are unit tested using the same structure as the function unit tests, "Arrange, Act, Assert". Any dependencies which are usually injected are mocked and return test data. Concepts from the functions testing above also apply here.

For method calls with complex parameters a callback can be used to capture the parameters and make assertions on them.

```cs
// setup mock to return mocked search response and use callback to store calling parameters for later assertions
string actualQuery = "";
var actualOptions = new SearchOptions();

mockSearchClient.Setup(x => x
.SearchAsync<SearchDocument>(query, It.IsAny<SearchOptions>(), default))
.ReturnsAsync(Response.FromValue(mockResults, mockResponse.Object))
.Callback<string, SearchOptions, CancellationToken>((q, s, c) =>
    {
        actualQuery = q;
        actualOptions = s;
    });

// act
var result = await searchController.Search(payload);

// assert
Assert.Equal(query, actualQuery);
Assert.Null(actualOptions.Filter);
Assert.Empty(actualOptions.Select);
Assert.Equal(SearchMode.Any, actualOptions.SearchMode);
Assert.Equal(SearchQueryType.Simple, actualOptions.QueryType);
```

### Web/Ui

The tests for the Web/Ui are located in the folder `src/dotnet/web/ui/src/__tests__`. Since the UI is a React application, the tests use [jest](https://jestjs.io/) and the [react testing library](https://testing-library.com/docs/react-testing-library/intro/) for testing.

The file/folder structure is mimicked from the production code. For each class that is tested one file is created containing several test methods. The tests for components and hooks can be seen as unit tests since they only render this particular class. Meanwhile, the tests for pages are more complex and render multiple components as well as the authentication provider at once.

The Ui tests are focused on the experience and expectations of the user. The tests always assert what the user expects to see, if a particular component is present on the page and what the user expects to happen if they for example click on a certain button. 

For example, when we render the simple `NothingHereComponent`, which appears when a user tries to access a url that doesn't exist, we expect a text and the Al Jazeera logo to appear.

```ts
test('Component renders correctly', () => {
    // Rendering the component
    render(<NothingHereComponent />);

    // Asserting that the text ist present
    expect(screen.getByText('The url you are trying to reach does not exist.')).toBeInTheDocument();
    // Asserting that an image is present
    expect(screen.getByRole('img')).toBeInTheDocument();
    // Asserting that is is the correct image
    expect(screen.getByRole('img')).toHaveAttribute('src', 'ajz-30.png');
  });
```

In more complex components like the `Collapsible` component, we can assert that the click of a certain button correctly opens the panel.

```ts
  test('Button opens the panel correctly when user clicks on it', () => {
    // Render the component
    render(<Collapsible label="Country" />);

    // Retrieve components for assertion
    let innerDiv = screen.getByTestId('collapsible-inner-div');
    let defaultButton = screen.getByTestId('collapsible-fluentui-defaultbutton');

    // Assert that the innerDiv is currently hidden
    expect(innerDiv.style.visibility).toBe('collapse');

    // Click the button
    userEvent.click(defaultButton);

    // Assert that the innerDiv is now visible
    expect(innerDiv.style.visibility).toBe('visible');
  });
```

Testing hooks is less visual and more focused on the functionality since they are not visual components. Since hooks can provide a variety of functionality it's difficult to describe "the" hook test. One example could be changing a state variable value and expecting the hook to now provide the updated value (see `hooks/useStorage.test.tsx`). Another example would be calling an api through a hook and expecting the correct return value (see `hooks/useApi.test.tsx`).

Some hooks as well as most pages require authentication to work correctly. In the tests we want to mock this authentication. This is done by mocking the public client application used by `MsalProvider`. The mock can be found under `misc/MockPublicClientApplication.ts`. Additionally any event callbacks and all redirects as well as api fetchs need to be mocked. An example of this can be seen in `pages/HomePage.test.tsx`. By now, the code to properly mock the authentication with Msal has been published as a ready to use [Msal React Tester](https://github.com/Mimetis/msal-react-tester) library on github. 

## Integration Tests

Integration tests are defined as tests which use actual resources instead of mocking services outside of the tested class. They test the system as a whole and can be considered mini smoke tests for parts of the application. They are intended to be run as part of a pipeline which first creates the environment and then runs the tests. With integration tests you can verify the correct flow of the application and that everything is working together properly.

The .NET integration tests in this project use the [Xunit Framework](https://xunit.net/).

### Environment

The testing environment is created on the fly during pipeline execution. It is created from the same terraform definitions as the production environment so in a way the integration tests also verify the infrastructure.

### Functions

The function integration tests can be found in the folder `src/dotnet/integration_tests/Functions.Tests`. All the integration tests for Azure function apps are written using .NET, so they can be found in this folder even for function apps which are written in Python (such as func_trigger and func_dataproc). Every function app will have its own file containing all the integration tests for this app, for example all tests for func_trigger can be found in the file `FuncTriggerIntegrationTests.cs`.

The integration tests have their own C# project, separate from the rest of the code which you can see in the project file `src/dotnet/integration_tests/Functions.Tests/Functions.Tests.csproj`. This is best practice because then testing dependencies don't have to be present in the production code.

The pipeline definition to run these integration tests can be found under `src/dotnet/integration_tests/.azurepipelines`.

Any test data (real videos and XML files to upload) is contained in the folder `src/dotnet/integration_tests/assets`.

The file `Startup.cs` creates a new configuration from environment variables (which are defined by the terraform deployment) which can be injected into the test classes.

The test file uses the injected configuration to retrieve any variables such as the name of the storage endpoint. These are then used to mimic the flow of the application in production, for example upload the test data assets to storage to test whether they are processed correctly by the queue trigger.


### Web/Api

Currently there aren't any integration tests for the web/api. If they are created, they will be located in the same folder as the function integration tests and use the same environment.