# How to set up and deploy new lambda functions
Updated 2/18/23 by ShrimpCryptid.

### Steps to build and deploy lambda manually:
1. From the project root, run `npm run compile-lambda`. This will compile the
lambda files using esbuild and save the output to the `out` folder. (This does
a few additional things, including minifying and bundling the lambda code. This
also ensures that only dependencies are compiled with the lambda function.)
2. ZIP the files in the `out` folder. (The name of the ZIP does not matter.)
3. Log into AWS and open the lambda manager. Open the lambda you want to test
with, or create a new one from scratch.
4. On the **Code** tab, click on the **Upload from** dropdown and upload the ZIP
file. Hit **Save**.

**Additional first-time setup steps:**

5. Under **Runtime Settings**, change the Handler so it runs the correct
function handler.
For the `notification_dispatcher` lambda, set it to
`notification_dispatcher.lambdaHandler`.
6. On the **Configuration** tab, update the **Environment variables** with the
database configuration.
7. Under **General configuration**, change the Timeout to 15 minutes.
8. For lambdas that need to run automatically, use the AWS EventBridge with the
scheduler option to run them on a set schedule.

### Deploying automatically
*TODO*

### Making new lambda functions
1. Open the `package.json` and update the script line for `compile-lambda`. Add
the relative path to the new lambda function you have created.
2. Repeat the above steps to add it to an AWS lambda.
