import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollTrigger);

// Simple scroll control object to replace ScrollSmoother
export const smoother = {
  paused: (value?: boolean) => {
    if (value !== undefined) {
      document.body.style.overflow = value ? "hidden" : "auto";
    }
  },
  scrollTop: (value?: number) => {
    if (value !== undefined) {
      window.scrollTo({ top: value, behavior: "auto" });
    }
    return window.scrollY;
  },
  scrollTo: (target: string, smooth?: boolean, _position?: string) => {
    const element = document.querySelector(target);
    if (element) {
      element.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    }
  },
};

const Navbar = () => {
  useEffect(() => {
    // Enable smooth scrolling via CSS
    document.documentElement.style.scrollBehavior = "smooth";
    
    smoother.scrollTop(0);
    smoother.paused(true);

    let links = document.querySelectorAll(".header ul a");
    links.forEach((elem) => {
      let element = elem as HTMLAnchorElement;
      element.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          let elem = e.currentTarget as HTMLAnchorElement;
          let section = elem.getAttribute("data-href");
          if (section) {
            smoother.scrollTo(section, true, "top top");
          }
        }
      });
    });
    
    window.addEventListener("resize", () => {
      ScrollTrigger.refresh(true);
    });
  }, []);
  
  return (
    <>
      <div className="header">
        <a href="/#" className="navbar-title" data-cursor="disable">
          RC
        </a>
        <a
          href="mailto:rajeshchittyal21@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          rajeshchittyal21@gmail.com
        </a>
        <ul>
          <li>
            <a data-href="#about" href="#about">
              <HoverLinks text="ABOUT" />
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work">
              <HoverLinks text="WORK" />
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact">
              <HoverLinks text="CONTACT" />
            </a>
          </li>
        </ul>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
