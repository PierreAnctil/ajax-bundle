<?php

namespace Axiolab\AjaxBundle\Model;

use Symfony\Component\HttpFoundation\Response;

class AjaxResponse extends Response
{
    const STATUS_SUCCESS = 1;
    const STATUS_INFO = 2;
    const STATUS_WARNING = 3;
    const STATUS_ERROR = 4;

    protected $status = self::STATUS_SUCCESS;
    protected $notify = false;
    protected $messages = [];
    protected $template = null;
    protected $data = null;
    protected $options = [];
    protected $removed = false;

    /**
     * Gets the value of status.
     *
     * @return mixed
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Sets the value of status.
     *
     * @param mixed $status the status
     *
     * @return self
     */
    public function setStatus($status = self::STATUS_SUCCESS)
    {
        if (!in_array($status, [self::STATUS_ERROR, self::STATUS_SUCCESS, self::STATUS_WARNING, self::STATUS_INFO])) {
            throw new \Exception('AjaxResponse: invalid status given');
        }
        $this->status = $status;

        return $this;
    }

    /**
     * Gets the value of notify.
     *
     * @return mixed
     */
    public function getNotify()
    {
        return $this->notify;
    }

    /**
     * Sets the value of notify.
     *
     * @param mixed $notify the notify
     *
     * @return self
     */
    public function setNotify($notify)
    {
        $this->notify = $notify;

        return $this;
    }

    /**
     * Gets the value of messages.
     *
     * @return mixed
     */
    public function getMessages()
    {
        return $this->messages;
    }

    /**
     * Sets the value of messages.
     *
     * @param mixed $messages the messages
     *
     * @return self
     */
    public function setMessages($messages)
    {
        if (!is_array($messages)) {
            $messages = [$messages];
        }

        $this->messages = $messages;

        return $this;
    }

    /**
     * Gets the value of template.
     *
     * @return mixed
     */
    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * Sets the value of template.
     *
     * @param mixed $template the template
     *
     * @return self
     */
    public function setTemplate($template)
    {
        $this->template = $template;

        return $this;
    }

    /**
     * Gets the value of data.
     *
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Sets the value of data.
     *
     * @param mixed $data the data
     *
     * @return self
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Gets the value of options.
     *
     * @return mixed
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Sets the value of options.
     *
     * @param mixed $options the options
     *
     * @return self
     */
    public function setOptions(array $options)
    {
        $this->options = $options;

        return $this;
    }

    /**
     * Gets the value of removed.
     *
     * @return mixed
     */
    public function getRemoved()
    {
        return $this->removed;
    }

    /**
     * Sets the value of removed.
     *
     * @param mixed $removed the removed
     *
     * @return self
     */
    public function setRemoved($removed)
    {
        $this->removed = $removed;

        return $this;
    }
}
