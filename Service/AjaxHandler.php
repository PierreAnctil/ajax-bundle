<?php

namespace Axiolab\AjaxBundle\Service;

use Axiolab\AjaxBundle\Model\AjaxResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Serializer\Serializer;

class AjaxHandler
{
    public function __construct()
    {
        $encoders = [new JsonEncoder()];
        $normalizers = [new ObjectNormalizer()];

        $this->serializer = new Serializer($normalizers, $encoders);
    }

    public function jsonResponse($data, $status = AjaxResponse::STATUS_SUCCESS, $notify = false, $messages = [], $options = [])
    {
        $response = new AjaxResponse();
        $response->setData($data)
            ->setStatus($status)
            ->setNotify($notify)
            ->setMessages($messages)
            ->setOptions($options)
        ;

        return new Response($this->serializer->serialize($response, 'json'));
    }

    public function render($template, $status = AjaxResponse::STATUS_SUCCESS, $notify = false, $messages = [], $options = [])
    {
        $response = new AjaxResponse();
        $response->setTemplate($template)
            ->setStatus($status)
            ->setNotify($notify)
            ->setMessages($messages)
            ->setOptions($options)
        ;

        return new Response($this->serializer->serialize($response, 'json'));
    }

    public function renderOnly($template, $status, $options = [])
    {
        return $this->render($template, $status, null, null, $options);
    }

    public function renderAndNotify($template, $status, $messages, $options = [])
    {
        return $this->render($template, $status, true, $messages, $options);
    }
}