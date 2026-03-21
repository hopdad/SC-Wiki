import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Supply Chain Knowledge',
    description: (
      <>
        Comprehensive documentation of Meijer's end-to-end supply chain —
        from procurement and warehouse operations to transportation and store delivery.
      </>
    ),
  },
  {
    title: 'Software Systems',
    description: (
      <>
        Detailed guides for WMS, TMS, inventory systems, and integrations.
        Includes architecture diagrams, workflows, and troubleshooting.
      </>
    ),
  },
  {
    title: 'Integrations & EDI',
    description: (
      <>
        EDI transaction sets, API documentation, data flow diagrams,
        and trading partner specifications all in one place.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{padding: '2rem 1rem'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
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
