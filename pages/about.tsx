import { DefaultPageProps } from "./_app";
import styles from "../styles/about.module.css";
import mainLogo from "../public/images/main_logo.svg";
import Image from "next/image";
import { LinkWithChildren, makeHomeLink, makeLink } from "../lib/frontend_utils";
import kofiButton from "../public/images/ko-fi_button.png";

export default function About({}: DefaultPageProps) {
  return (
    <div style={{width: "calc(90vmin - 30px)", justifySelf: "center", margin: "0 auto"}}>
      <br/>
      
      {makeHomeLink()}
      <div className="panel">
        <br/>
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
      </div>

      <div className="panel">
        <h2 className={styles.h2}>❤️Acknowledgements:</h2>
        <p>Gear images and icons were sourced from {makeLink("Inkipedia", "https://splatoonwiki.org/")}, the Splatoon wiki.
        Gear rotation data is fetched from the {makeLink("Splatoon3.ink API", "https://splatoon3.ink/")}, built by Matt Isenhower.</p>
        <p>Splatoon and the SplatNet app belong to Nintendo.</p>
        <p>Special thanks to the {makeLink("Nintendo APIs/nxapi Discord server", "https://discord.com/invite/4D82rFkXRv")} for their help and advice!</p>
      </div>

      <div className="panel">

      <h2 className={styles.h2}>Frequently Asked Questions (FAQ):</h2>

      <h3 className={styles.h3}>What data does this website store?</h3>
      <p>Your user ID is stored locally in the browser so you don't have to log
        in every time you visit!
        <br/><br/>        
        Note that the server assigns you a <b>random</b> user
        ID when you make your first filter.
        (I have a lot of security concerns with storing passwords, so no
        personal login information is collected.)
        <br/><br/>
        Currently, the server ties the following information to your user ID:
        <br/>- Filters you've set
        <br/>- Account nickname
        <br/>- The last time your account was accessed and notified
        <br/>- Push configuration for any devices you've requested notifications on
        <br/><br/>
        Push configuration generally does not include any identifying
        information about your device, and is wiped from the server when you
        turn off notifications.<br/>
        <br/>
        {makeLink("Click here to read more about how push notifications work.", "https://felixgerschau.com/web-push-notifications-tutorial/#what-are-web-push-notifications")}
        <br/><br/>I use Google Analytics to keep track of how many
          people use this website. (Also, I like watching numbers go up.)
      </p>

      <h3 className={styles.h3}>How fast will SplatNet Alerts update me?</h3>
      <p>Notifications will be sent out within 15 minutes of
        when a new gear item first appears. You'll have up to 24 hours to
        claim it from SplatNet!
      </p>

      <h3 className={styles.h3}>Help! I've lost my user ID!</h3>
      <p>
        If you turned on notifications, expanding the notification and clicking
        'Edit Filters' the next time you're alerted will automatically sign you
        back in.
        <br/>If notifications weren't turned on, you can make a new account
        instead.
      </p>

    <h3 className={styles.h3}>Help! I keep getting an error message while turning on notifications!</h3>
    <p>
      I've written a guide for most devices here: {makeLink("Enabling Notifications Help Guide", "https://github.com/ShrimpCryptid/SplatNet-Alerts/issues/3")}
    </p>
  
      <h3 className={styles.h3}>Will old accounts ever be deleted?</h3>
      <p>
        Probably! I may clean out accounts that haven't been accessed in 6-12
        months and don't have notifications enabled, as the database service I
        use has a usage quota.
        <br/>I think I've optimized my database pretty well though so we'll see
        if it's an issue!
      </p>

      <h3 className={styles.h3}>I have a feature I'd like to request or a bug to report!</h3>
      <p>
        Great! You can suggest features and report bugs on the {makeLink("GitHub repository for this project", "https://github.com/ShrimpCryptid/SplatNet-Alerts")}.
        <br/><br/>I'm also open to contributors, so if you're interested in
        development please read the setup guide that will be added in the near future.
      </p>

      <h3 className={styles.h3}>How is this website made?</h3>
      <p>
        The SplatNet Alerts website is made using NEXT.js, which incorporates
        both the front-end (React) and the backend (NodeJS). Recurring jobs for
        tasks like sending notifications are handled by AWS Lambda functions.
        <br/><br/> Additional images were made by me using Inkscape, a free
        vector editing software!
      </p>

      <h3 className={styles.h3}>I want to give you all my money.</h3>
      <p>You want to give me all your money.</p>
      
      <LinkWithChildren url={"https://ko-fi.com/shrimpcryptid"}>
        <div className={styles.kofiButton}>
          <Image
            src={kofiButton}
            layout={"fill"}
            alt={"Ko-fi coffee cup logo (text: Support me on Ko-fi)"}
          />
        </div>
      </LinkWithChildren>

      <h3 className={styles.h3}>How can I reach you?</h3>
      <p>You can contact me via Twitter at {makeLink("@ShrimpCryptid", "https://twitter.com/ShrimpCryptid")}!</p>
      </div>

      {makeHomeLink()}
    </div>
  )
}
