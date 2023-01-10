import Link from "next/link";
import { DefaultPageProps } from "./_app";
import styles from "../styles/about.module.css";
import mainLogo from "../public/images/main_logo.svg";
import Image from "next/image";

export default function About({}: DefaultPageProps) {
  return (
    <div style={{width: "calc(90vmin - 30px)", justifySelf: "center", margin: "0 auto"}}>
      <br/>
      <p><b><Link href="/">🠔 Back to Home</Link></b></p>

      <div className={styles.splashImage}>
        <Image 
          src={mainLogo}
          layout={"fill"}
          alt={"Website logo: an orange autobomb wearing the 18k aviators."}
        />
      </div>

      <h2 className={styles.h2}>What's this website do?</h2>
      <p>SplatNet Alerts is an unofficial, fan-made 
        web service that lets you set up notifications for gear items in the
        Splatnet app.
        <br/><br/>It uses push notifications to send notifications directly to your
        device whenever items you're interested in arrive in the shop!
      </p>

      <br/>
      <h2 className={styles.h2}>💖Acknowledgements:</h2>
      <p>Gear images and icons were sourced from <Link href="https://splatoonwiki.org/">Inkipedia</Link>, the Splatoon wiki.
      Gear rotation data is fetched from the <Link href="https://splatoon3.ink/">Splatoon3.ink API</Link>, built by Matt Isenhower.</p>
      <p>Splatoon and the SplatNet app belong to Nintendo.</p>
      <p>Special thanks to the <Link href="https://discord.com/invite/4D82rFkXRv">Nintendo APIs/nxapi Discord server</Link> for their help and advice!</p>

      <br/>
      <h2 className={styles.h2}>Frequently Asked Questions (FAQ):</h2>

      <h3 className={styles.h3}>What data does this website store?</h3>
      <p>Some login information (your user ID) is stored locally in the browser
        as cookies so you don't have to log in every time you visit.
        <br/><br/>        
        The server assigns you a random user ID when you make your first filter. (I have a lot of security concerns with storing passwords, so no personal login information is collected.)
        <br/><br/>
        Currently, the server ties the following information to your user ID:
        <br/>- Filters you've set
        <br/>- Account nickname
        <br/>- The last time your account was accessed and notified
        <br/>- Push configuration for any devices you've requested notifications on
        <br/><br/>
        Push configuration generally does not include any identifying information about your device, and is wiped when you turn off notifications.<br/>
        <br/>
        <Link href="https://felixgerschau.com/web-push-notifications-tutorial/#what-are-web-push-notifications">Click here to read more about how push notifications work.</Link>
        <br/><br/><p>I will also be adding Google Analytics in the near future to
          keep track of how many people use this website and how I might improve it.
        </p> 
      </p>

      <h3 className={styles.h3}>How fast does SplatNet Alerts update?</h3>
      <p>SplatNet Alerts currently uses a scheduled GitHub Action to trigger
        the notifications. These actions are submitted as requests, so sometimes
        GitHub may choose to ignore or skip them, resulting in a slight delay.
        <br/><br/> Notifications will generally be sent out within 30 minutes of
        when a new gear item first appears. You'll have up to 23 hours to
        claim it from SplatNet!
      </p>

      <h3 className={styles.h3}>Help! I've lost my user ID!</h3>
      <p>
        If you turned on notifications, expanding the notification and clicking
        'User Settings' the next time you're alerted will automatically sign you
        back in.
        <br/>If notifications weren't turned on, you can make a new account
        instead.
      </p>

      <h3 className={styles.h3}>Will old accounts ever be deleted?</h3>
      <p>
        Probably! I may clean out accounts that haven't been accessed in 6-12
        months and don't have notifications enabled, as the database service I
        use has a usage quota.
      </p>

      <h3 className={styles.h3}>I have a feature I'd like to request or a bug to report!</h3>
      <p>
        Great! You can suggest features and report bugs on the <Link href="https://github.com/ShrimpCryptid/splatnet-shop-alerts">GitHub repository for this project</Link>.
        <br/><br/>I'm also open to contributors, so if you're interested in
        development please read the setup guide that will be added in the near future.
      </p>

      <h3 className={styles.h3}>How is this website made?</h3>
      <p>
        SSA's website is made using React and NextJS, and the backend is built
        using NodeJS.
      </p>

      <h3 className={styles.h3}>How can I reach you?</h3>
      <p>You can contact me via Twitter at <Link href="https://twitter.com/ShrimpCryptid">@ShrimpCryptid</Link>!</p>

      <br/>
      <p><b><Link href="/">🠔 Back to Home</Link></b></p>
    </div>
  )
}
