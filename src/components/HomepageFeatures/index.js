import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Supply Chain Knowledge',
    link: '/docs/supply-chain/overview',
    description: (
      <>
        Comprehensive documentation of Meijer's end-to-end supply chain —
        from procurement and warehouse operations to transportation and store delivery.
      </>
    ),
  },
  {
    title: 'Software Systems',
    link: '/docs/systems/overview',
    description: (
      <>
        Detailed guides for WMS, TMS, inventory systems, and integrations.
        Includes architecture diagrams, workflows, and troubleshooting.
      </>
    ),
  },
  {
    title: 'Integrations & EDI',
    link: '/docs/systems/integrations/overview',
    description: (
      <>
        EDI transaction sets, API documentation, data flow diagrams,
        and trading partner specifications all in one place.
      </>
    ),
  },
];

function Feature({title, link, description}) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={link} className="sc-feature-card text--center">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
