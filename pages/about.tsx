import Link from "next/link";
import { DefaultPageProps } from "./_app";


export default function About({}: DefaultPageProps) {
  return (
    <div style={{width: "calc(90vmin - 30px)", justifySelf: "center", margin: "0 auto"}}>
      <br/>
      <p><b><Link href="/">🠔 Back to Home</Link></b></p>
      <p>SplatNet Alerts is an unofficial, fan-made 
        web service that lets you set up notifications for gear items in the
        Splatnet app.
        <br/><br/>It uses push notifications to send notifications directly to your
        device whenever new items arrive in the shop!
      </p>

      <br/>
      <h2>Acknowledgements</h2>
      <p>Gear images and icons were sourced from <Link href="https://splatoonwiki.org/">Inkipedia</Link>, the Splatoon wiki.
      Gear rotation data is fetched from the <Link href="https://splatoon3.ink/">Splatoon3.ink API</Link>, built by Matt Isenhower.</p>
      <p>Splatoon and the SplatNet app belong to Nintendo.</p>
      <p>Special thanks to the <Link href="https://discord.com/invite/4D82rFkXRv">Nintendo APIs/nxapi Discord server</Link> for their help and advice!</p>

      <br/>
      <h2>Frequently Asked Questions (FAQ)</h2>

      <h3>What data does this website store?</h3>
      <p>This website assigns you a user ID when you make your first filter, so no passwords or logins are collected.
        <br/><br/>
        What it does store:
        <br/>- What filters you've set
        <br/>- An optional nickname for your account
        <br/>- Push configurations for any devices you've requested notifications on
        <br/><br/><Link href="https://felixgerschau.com/web-push-notifications-tutorial/#what-are-web-push-notifications">Click here to read more about push notifications.</Link>
      </p>

      <h3>How fast does SplatNet Alerts update?</h3>
      <p>SplatNet Alerts currently uses a scheduled GitHub Action to trigger
        the notifications. These actions are requests, so sometimes GitHub may
        choose to ignore or skip them.
        <br/><br/> Notifications will generally be sent out within 10-20 minutes of
        when a new gear item first appears. You'll have around 23-24 hours to
        claim it from SplatNet when it does.
      </p>

      <h3>Help! I've lost my user ID!</h3>
      <p>
        If you turned on notifications, clicking the notification link the next
        time you're alerted about a new item will automatically sign you back in.
        <br/>If notifications weren't turned on, you can make a new account instead.
      </p>

      <h3>I have a feature I'd like to request or a bug to report!</h3>
      <p>
        Great! You can suggest features and report bugs on the <Link href="https://github.com/ShrimpCryptid/splatnet-shop-alerts">GitHub repository for this project</Link>.
        <br/><br/>I'm also open to contributors, so if you're interested in
        development please read the setup guide that will be added in the near future.
      </p>

      <h3>How is this website made?</h3>
      <p>
        SSA's website is made using React and NextJS, and the backend is built
        using NodeJS.
      </p>

      <h3>How can I reach you?</h3>
      <p>You can contact me via Twitter at <Link href="https://twitter.com/ShrimpCryptid">@ShrimpCryptid</Link>!</p>

      <br/>
      <p><b><Link href="/">🠔 Back to Home</Link></b></p>
    </div>
  )
}
